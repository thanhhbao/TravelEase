import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, CreditCard, Lock, Headphones, MapPin, Star } from "lucide-react";

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
};

export default function Checkout() {
  const { state } = useLocation() as { state: LocationState | null };
  // fallback demo nếu vào trực tiếp
  const data: LocationState =
    state ?? {
      hotelId: 0,
      hotelName: "Sample Hotel",
      hotelSlug: "sample",
      roomId: 1,
      roomName: "Deluxe King",
      checkIn: new Date().toISOString().slice(0, 10),
      checkOut: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      guests: 2,
      nights: 2,
      pricePerNight: 180,
      totalPrice: 360,
      thumbnail:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&auto=format&fit=crop",
      city: "Hanoi",
      country: "Vietnam",
    };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreeSMS, setAgreeSMS] = useState(true);

  const bookingFee = 12; // demo
  const subtotal = useMemo(() => data.totalPrice, [data.totalPrice]);
  const grandTotal = useMemo(() => subtotal + bookingFee, [subtotal]);

  return (
    <div className="min-h-screen bg-white">
      {/* Steps */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <ol className="flex items-center gap-6 text-sm">
          <StepDot active={step >= 1} title="Travel Detail" onClick={() => setStep(1)} />
          <Divider />
          <StepDot active={step >= 2} title="Payment Detail" onClick={() => setStep(2)} />
          <Divider />
          <StepDot active={step >= 3} title="Payment Result" onClick={() => setStep(3)} />
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
              {/* Payment Detail */}
              <Section title="Payment Detail">
                {/* ----- Stripe slot ----- */}
                {/* 
                  Khi tích hợp thật, bọc trang ở cấp cao hơn:
                  
                  import {Elements} from '@stripe/react-stripe-js';
                  <Elements stripe={stripePromise} options={{appearance:{theme:'stripe'}}}>
                    <Checkout />
                  </Elements>

                  Và ở đây render:
                  <PaymentElement /> hoặc <CardElement />
                  Bạn vẫn giữ nguyên layout/viền/heading bên ngoài, 
                  Stripe phần tử tự chiếm chỗ bên trong.
                */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-800 mb-3">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-semibold">Card Information</span>
                  </div>

                  {/* Placeholder UI (demo) */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input label="Card Number" placeholder="4242 4242 4242 4242" />
                    <Input label="Name on Card" placeholder="Your name" />
                    <div className="grid grid-cols-2 gap-3 md:col-span-2">
                      <Input label="Expiry" placeholder="MM/YY" />
                      <Input label="CVC" placeholder="CVC" />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                    <Lock className="h-4 w-4" /> Your payment is secured with SSL encryption.
                  </p>
                </div>
              </Section>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 md:flex-none md:w-48 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
                >
                  Pay Now
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-12 rounded-2xl border border-slate-200 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Payment Successful</h2>
              <p className="mt-2 text-slate-600">
                Your reservation has been confirmed. A confirmation email has been sent to you.
              </p>
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
              <Row label="Booking fee" value={`$ ${bookingFee.toFixed(2)}`} />
              <Row label="Subtotal" value={`$ ${subtotal.toFixed(2)}`} />
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold">
                <dt>Grand Total</dt>
                <dd>$ {grandTotal.toFixed(2)}</dd>
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
function StepDot({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick?: () => void;
}) {
  return (
    <li className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
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
}: {
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
