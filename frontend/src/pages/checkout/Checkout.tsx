import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Check,
  CreditCard,
  Lock,
  Headphones,
  MapPin,
  Star,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { createBooking, createPaymentIntent } from "../../lib/api";

type LocationState = {
  hotelId: number;
  hotelName: string;
  hotelSlug: string;
  roomId: number;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  thumbnail: string;
  city: string;
  country: string;
  flightId?: number;
};

type BookingPayload = {
  hotel_id?: number;
  room_id?: number;
  flight_id?: number;
  check_in?: string;
  check_out?: string;
  guests: number;
  total_price: number;
};

type PaymentIntentState = {
  loading: boolean;
  clientSecret: string;
  publishableKey: string;
  paymentIntentId: string;
  currency: string;
  error: string;
};

type BookingResult = {
  id: number;
  status: string;
  total_price: number;
  currency: string;
  check_in?: string | null;
  check_out?: string | null;
  created_at?: string;
  hotel?: { name?: string | null };
  room?: { name?: string | null };
};

export default function Checkout() {
  const { state } = useLocation() as { state: LocationState | null };
  const data = useMemo<LocationState>(
    () =>
      state ?? {
        hotelId: 0,
        hotelName: "Sample Hotel",
        hotelSlug: "sample",
        roomId: 1,
        roomName: "Deluxe King",
        checkIn: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        checkOut: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        guests: 2,
        nights: 2,
        pricePerNight: 180,
        totalPrice: 360,
        thumbnail:
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&auto=format&fit=crop",
        city: "Hanoi",
        country: "Vietnam",
        flightId: undefined,
      },
    [state]
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreeSMS, setAgreeSMS] = useState(true);
  const [intentState, setIntentState] = useState<PaymentIntentState>({
    loading: false,
    clientSecret: "",
    publishableKey: "",
    paymentIntentId: "",
    currency: "usd",
    error: "",
  });
  const [bookingResult, setBookingResult] = useState<unknown | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const bookingSummary = useMemo(
    () => (isBookingResult(bookingResult) ? bookingResult : null),
    [bookingResult]
  );

  const bookingFee = 12; // demo
  const subtotal = useMemo(() => data.totalPrice, [data.totalPrice]);
  const grandTotal = useMemo(() => subtotal + bookingFee, [subtotal]);
  const amount = useMemo(() => Number(grandTotal.toFixed(2)), [grandTotal]);
  const stripePromise = useMemo(
    () => (intentState.publishableKey ? loadStripe(intentState.publishableKey) : null),
    [intentState.publishableKey]
  );
  const elementsOptions = useMemo(
    () =>
      intentState.clientSecret
        ? {
            clientSecret: intentState.clientSecret,
            appearance: {
              theme: "stripe" as const,
              variables: {
                colorPrimary: "#0f172a",
                borderRadius: "14px",
              },
            },
          }
        : undefined,
    [intentState.clientSecret]
  );
  const bookingPayload = useMemo<BookingPayload>(() => {
    const payload: BookingPayload = {
      guests: data.guests,
      total_price: amount,
    };

    if (data.hotelId) {
      payload.hotel_id = data.hotelId;
      if (data.roomId) payload.room_id = data.roomId;
      if (data.checkIn) payload.check_in = data.checkIn;
      if (data.checkOut) payload.check_out = data.checkOut;
    }

    if (data.flightId) {
      payload.flight_id = data.flightId;
    }

    return payload;
  }, [amount, data]);

  const fetchIntent = useCallback(async () => {
    setIntentState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      clientSecret: "",
      publishableKey: "",
      paymentIntentId: "",
    }));

    const metadata: Record<string, string> = {
      booking_type: data.hotelId ? "hotel" : data.flightId ? "flight" : "custom",
      guests: String(data.guests),
      nights: String(data.nights),
      hotel_name: data.hotelName,
      hotel_slug: data.hotelSlug,
      room_name: data.roomName,
      city: data.city,
      country: data.country,
    };

    if (data.hotelId) metadata.hotel_id = String(data.hotelId);
    if (data.roomId) metadata.room_id = String(data.roomId);
    if (data.flightId) metadata.flight_id = String(data.flightId);
    if (data.checkIn) metadata.check_in = data.checkIn;
    if (data.checkOut) metadata.check_out = data.checkOut;

    try {
      const { data: intent } = await createPaymentIntent({
        amount,
        currency: "usd",
        description: `TravelEase booking for ${data.hotelName}`,
        metadata,
      });

      setIntentState({
        loading: false,
        error: "",
        clientSecret: intent.clientSecret,
        publishableKey: intent.publishableKey,
        paymentIntentId: intent.paymentIntentId,
        currency: intent.currency ?? "usd",
      });
    } catch (error) {
      let message = "Unable to initialise payment. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = "Please sign in to complete your payment.";
        } else {
          const responseData = error.response?.data as
            | { message?: string; stripe?: string; payment?: string }
            | undefined;
          message =
            responseData?.stripe ??
            responseData?.payment ??
            responseData?.message ??
            message;
        }
      }

      setIntentState({
        loading: false,
        error: message,
        clientSecret: "",
        publishableKey: "",
        paymentIntentId: "",
        currency: "usd",
      });
    }
  }, [amount, data]);

  useEffect(() => {
    if (step !== 2) return;
    if (intentState.clientSecret || intentState.loading || intentState.error) return;

    void fetchIntent();
  }, [fetchIntent, intentState.clientSecret, intentState.error, intentState.loading, step]);

  const handlePaymentSuccess = useCallback((booking: unknown, message?: string | null) => {
    setBookingResult(booking ?? null);
    setBookingMessage(message ?? null);
    setStep(3);
  }, []);

  const handleProcessingChange = useCallback((processing: boolean) => {
    setIsProcessingPayment(processing);
  }, []);

  const handleRetryIntent = useCallback(() => {
    void fetchIntent();
  }, [fetchIntent]);

  const resetCheckoutFlow = useCallback(() => {
    setIntentState({
      loading: false,
      clientSecret: "",
      publishableKey: "",
      paymentIntentId: "",
      currency: "usd",
      error: "",
    });
    setBookingResult(null);
    setBookingMessage(null);
    setIsProcessingPayment(false);
    setFormErrors([]);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Steps */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <ol className="flex items-center gap-6 text-sm">
          <StepDot
            active={step >= 1}
            title="Travel Detail"
            onClick={() => {
              setFormErrors([]);
              setStep(1);
            }}
          />
          <Divider />
          <StepDot active={step >= 2} title="Payment Detail" onClick={() => setStep(2)} />
          <Divider />
          <StepDot
            active={step >= 3}
            title="Payment Result"
            onClick={bookingSummary ? () => setStep(3) : undefined}
          />
        </ol>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Secure Checkout
          </h1>

          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 text-sm">
            Checkout securely – it takes only a few minutes
          </div>

          {step === 1 && (
            <div className="mt-8 space-y-8">
              {/* Contact Detail */}
              <Section title="Contact Detail">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Email" placeholder="input email" type="email" />
                  <Input label="Phone Number" placeholder="input phone number" />
                </div>
                <label className="mt-3 flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={agreeSMS}
                    onChange={(e) => setAgreeSMS(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    Receive text message updates about your booking. Message rates may apply.
                  </span>
                </label>
              </Section>

              {/* Traveler Detail */}
              <Section title="Traveler Detail">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="First Name" placeholder="input first name" />
                  <Input label="Last Name" placeholder="input last name" />
                </div>
                <Input label="Address" placeholder="input your address" className="mt-4" />
              </Section>

              {/* Promo code */}
              <Section title="Promo Code">
                <div className="relative">
                  <input
                    placeholder="input promo code"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                    Find promo code?
                  </button>
                </div>
              </Section>

              <div className="pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="w-full md:w-48 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600">
                      <CreditCard className="h-3.5 w-3.5" />
                      Payment Detail
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                      Confirm and pay
                    </h3>
                    <p className="text-sm text-slate-500">
                      Complete your reservation securely with Stripe.
                    </p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    Secure checkout
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-sky-100 via-white to-cyan-100 p-6 md:p-8 text-slate-900 shadow-2xl">
                  <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_55%)]" />
                  <div className="absolute -bottom-32 left-16 h-56 w-56 rounded-full bg-sky-200/60 blur-3xl pointer-events-none" />
                  <div className="absolute -top-28 right-10 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl pointer-events-none" />

                  <div className="relative space-y-6">
                    <div className="rounded-[28px] border border-sky-100 bg-white/85 backdrop-blur-xl p-6 md:p-8 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-sky-600">
                            Amount due
                          </p>
                          <h4 className="mt-2 text-2xl font-semibold">
                            {formatCurrency(amount, intentState.currency)}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Charged immediately when you confirm payment.
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                            Powered by Stripe
                          </span>
                        </div>
                      </div>
                    </div>

                    {intentState.loading && (
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
                        Preparing secure payment form...
                      </div>
                    )}

                    {intentState.error && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                        <p className="font-semibold">We couldn&apos;t start the payment.</p>
                        <p className="mt-1 text-sm">{intentState.error}</p>
                        <button
                          type="button"
                          onClick={handleRetryIntent}
                          className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                          disabled={intentState.loading}
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {!intentState.loading &&
                      !intentState.error &&
                      (!stripePromise || !elementsOptions || !intentState.paymentIntentId) && (
                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
                          Stripe is not configured correctly. Please verify your publishable key.
                        </div>
                      )}

                    {stripePromise &&
                      elementsOptions &&
                      intentState.paymentIntentId &&
                      !intentState.loading &&
                      !intentState.error && (
                        <Elements
                          key={intentState.clientSecret}
                          stripe={stripePromise}
                          options={elementsOptions}
                        >
                          <StripePaymentForm
                            amount={amount}
                            currency={intentState.currency}
                            paymentIntentId={intentState.paymentIntentId}
                            bookingPayload={bookingPayload}
                            onSuccess={handlePaymentSuccess}
                            onProcessingChange={handleProcessingChange}
                            isProcessing={isProcessingPayment}
                          />
                        </Elements>
                      )}

                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      TravelEase uses tokenized payments and never stores your full card details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setFormErrors([]);
                    setStep(1);
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                  disabled={isProcessingPayment}
                >
                  Back
                </button>
                <p className="text-xs text-slate-500">
                  Need help? Contact{" "}
                  <a href="mailto:support@travelease.com" className="font-semibold text-slate-700">
                    support@travelease.com
                  </a>
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-12 rounded-2xl border border-slate-200 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Payment Successful</h2>
              <p className="mt-2 text-slate-600">
                {bookingMessage ??
                  "Your reservation has been confirmed. A confirmation email has been sent to you."}
              </p>

              {bookingSummary && (
                <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-5 text-left text-sm text-slate-600">
                  <Row label="Booking ID" value={`#${bookingSummary.id}`} />
                  <Row label="Status" value={bookingSummary.status} />
                  <Row
                    label="Total paid"
                    value={formatCurrency(bookingSummary.total_price, bookingSummary.currency)}
                  />
                  {bookingSummary.check_in && <Row label="Check-in" value={bookingSummary.check_in} />}
                  {bookingSummary.check_out && (
                    <Row label="Check-out" value={bookingSummary.check_out} />
                  )}
                  {bookingSummary.hotel?.name && <Row label="Hotel" value={bookingSummary.hotel.name} />}
                  {bookingSummary.room?.name && <Row label="Room" value={bookingSummary.room.name} />}
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/dashboard/bookings"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View my bookings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    resetCheckoutFlow();
                    setStep(1);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Make another booking
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right summary panel */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Review Order Details</h3>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[0, 1, 2].map((i) => (
                <img
                  key={i}
                  src={data.thumbnail}
                  alt="thumb"
                  className="h-20 w-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop";
                  }}
                />
              ))}
            </div>

            <div className="flex items-start gap-3">
              <img
                src={data.thumbnail}
                alt={data.hotelName}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 leading-tight">
                  {data.hotelName}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400" /> 5
                  </span>
                  <span>•</span>
                  <span>128 Reviews</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {data.checkIn}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">1 PM</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {data.nights} Nights
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {data.city}, {data.country}
                </div>
              </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Booking fee" value={formatCurrency(bookingFee, intentState.currency)} />
              <Row label="Subtotal" value={formatCurrency(subtotal, intentState.currency)} />
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold">
                <dt>Grand Total</dt>
                <dd>{formatCurrency(grandTotal, intentState.currency)}</dd>
              </div>
            </dl>
          </div>

          {/* Trust badges */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Book with confidence</h4>
            <BadgeRow
              icon={<img src="/vite.svg" className="h-5 w-5" />}
              title="Lowest price guarantee"
              text="Find it cheaper? We'll refund the difference."
            />
            <BadgeRow
              icon={<Lock className="h-5 w-5" />}
              title="Privacy protection"
              text="We use SSL encryption to keep your data secure."
            />
            <BadgeRow
              icon={<Headphones className="h-5 w-5" />}
              title="24/7 global support"
              text="Get the answers you need, when you need them."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- Small components ---------------- */
type StripePaymentFormProps = {
  amount: number;
  currency: string;
  paymentIntentId: string;
  bookingPayload: BookingPayload;
  onSuccess: (booking: unknown, message?: string | null) => void;
  onProcessingChange: (processing: boolean) => void;
  isProcessing: boolean;
};

function StripePaymentForm({
  amount,
  currency,
  paymentIntentId,
  bookingPayload,
  onSuccess,
  onProcessingChange,
  isProcessing,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setMessage(null);
    onProcessingChange(true);

    try {
      if (!paymentConfirmed) {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

        if (error) {
          setMessage(error.message ?? "Payment could not be confirmed. Please try again.");
          return;
        }

        if (!paymentIntent) {
          setMessage("Payment confirmation failed. Please try again.");
          return;
        }

        if (paymentIntent.status === "succeeded") {
          setPaymentConfirmed(true);
        } else if (paymentIntent.status === "processing") {
          setMessage("Payment is processing. Please wait a few seconds and submit again.");
          return;
        } else {
          setMessage(
            `Payment status: ${paymentIntent.status}. Please try another payment method or contact support.`
          );
          return;
        }
      }

      const { data } = await createBooking({
        ...bookingPayload,
        currency,
        payment_intent_id: paymentIntentId,
      });

      onSuccess(data?.booking ?? null, data?.message ?? null);
    } catch (error) {
      let friendlyMessage = paymentConfirmed
        ? "We confirmed your payment, but booking failed. Please try again."
        : "Payment failed. Please check your details and try again.";

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          friendlyMessage = "Your session expired. Please sign in again.";
        } else {
          const responseData = error.response?.data as
            | { message?: string; errors?: Record<string, string[]> }
            | undefined;
          friendlyMessage =
            responseData?.message ??
            responseData?.errors?.payment_intent_id?.[0] ??
            friendlyMessage;
        }
      }

      setMessage(friendlyMessage);
    } finally {
      setSubmitting(false);
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />

      {message && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting || isProcessing}
        className={`w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition ${
          submitting || isProcessing ? "opacity-60" : "hover:bg-slate-800"
        }`}
      >
        {paymentConfirmed ? "Finalize booking" : `Pay ${formatCurrency(amount, currency)}`}
      </button>

      <p className="text-center text-xs text-slate-500">
        You will be charged {formatCurrency(amount, currency)}.
      </p>
    </form>
  );
}

function StepDot({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick?: () => void;
}) {
  const clickable = typeof onClick === "function";
  return (
    <li
      className={`flex items-center gap-3 ${
        clickable ? "cursor-pointer" : "cursor-default"
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <div
        className={`h-6 w-6 rounded-full grid place-items-center ${
          active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
        }`}
      >
        {active ? "✓" : "•"}
      </div>
      <span className={`font-medium ${active ? "text-slate-900" : "text-slate-500"}`}>
        {title}
      </span>
    </li>
  );
}

function Divider() {
  return <span className="h-px flex-1 bg-slate-200" />;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </section>
  );
}

function Input({
  label,
  placeholder,
  type = "text",
  className = "",
  variant = "default",
  inputClassName = "",
}: {
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  variant?: "default" | "glass";
  inputClassName?: string;
}) {
  const isGlass = variant === "glass";
  return (
    <label className={`block ${className}`}>
      <div
        className={`text-sm font-medium mb-1 ${
          isGlass ? "text-white/80" : "text-slate-700"
        }`}
      >
        {label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition ${inputClassName} ${
          isGlass
            ? "border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/40 focus:border-white/60"
            : "border-slate-200 focus:ring-2 focus:ring-slate-900/10"
        }`}
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-600">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}

function BadgeRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="shrink-0 text-slate-700">{icon}</div>
      <div>
        <div className="font-medium text-slate-800">{title}</div>
        <div className="text-sm text-slate-500">{text}</div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

function isBookingResult(value: unknown): value is BookingResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "number" &&
    typeof record.status === "string" &&
    typeof record.total_price === "number" &&
    typeof record.currency === "string"
  );
}
