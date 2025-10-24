import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plane,
  MapPin,
  Clock,
  ShieldCheck,
  Ticket,
  Calendar,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";

/** Khớp với type Flight bên FlightsNew */
type Flight = {
  id: number;
  airline: string;
  flightNumber: string;
  logo: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  price: number;
  class: string;
};

type Seat = {
  id: string;        // ví dụ "12A"
  row: number;       // 1..40
  col: string;       // A..F
  type: "standard" | "exit" | "extra" | "occupied";
  price: number;     // 0 nếu free
};
export default function FlightDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation() as { state?: { flight?: Flight; search?: { pax?: number } } };
  const flight = location.state?.flight;

  // Fallback demo khi vào trực tiếp URL (chưa nối API theo id)
  const notFound = useMemo(() => !flight, [flight]);

  // Stepper: 1-Review, 2-Seats, 3-Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Seat selection state
  const seatMap = useMemo<Seat[]>(() => {
    // Mock: 20 hàng, 6 cột (A–F), một số ghế bị chiếm/ghế exit/ghế extra-legroom
    const cols = ["A", "B", "C", "D", "E", "F"];
    const arr: Seat[] = [];
    for (let r = 5; r <= 24; r++) {
      for (const c of cols) {
        const id = `${r}${c}`;
        let type: Seat["type"] = "standard";
        let price = 0;

        // Hàng 10 & 11: exit row (trả phí)
        if (r === 10 || r === 11) {
          type = "exit";
          price = 25;
        }
        // Hàng 6–8: extra legroom (trả phí)
        if (r >= 6 && r <= 8) {
          type = "extra";
          price = 15;
        }
        // Vài ghế occupied ngẫu nhiên
        const occupiedSeeds = ["7C", "7D", "11A", "12F", "15B", "20E"];
        if (occupiedSeeds.includes(id)) {
          type = "occupied";
          price = 0;
        }
        arr.push({ id, row: r, col: c, type, price });
      }
    }
    return arr;
  }, []);

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const toggleSeat = (s: Seat) => {
    if (s.type === "occupied") return;
    setSelectedSeats((prev) => {
      const exists = prev.find((x) => x.id === s.id);
      if (exists) return prev.filter((x) => x.id !== s.id);
      return [...prev, s];
    });
  };

  const seatTotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

  const goPayment = () => setStep(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-sky-50/90 backdrop-blur supports-[backdrop-filter]:bg-sky-50/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl border border-sky-200 grid place-items-center hover:bg-sky-50"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Flight details {id ? `#${id}` : ""}</h1>
        </div>
      </header>

      {notFound ? (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="rounded-3xl border border-sky-100 bg-white p-10 text-center">
            <p className="text-slate-700">No flight data. Go back to Flights and choose Book again.</p>
            <button
              onClick={() => navigate("/flights")}
              className="mt-6 px-6 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
            >
              Back to flights
            </button>
          </div>
        </main>
      ) : (
        <>
          {/* Hero with cover image */}
          <section className="relative">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1490135900376-3f6b42e1b1dc?q=80&w=1600&auto=format&fit=crop"
                alt="Airplane window"
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-sky-900/50 via-sky-800/35 to-cyan-700/25" />
            </div>
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur ring-2 ring-white/60 overflow-hidden grid place-items-center">
                  <img
                    src={flight!.logo}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=128&auto=format&fit=crop";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-extrabold">{flight!.airline}</div>
                  <div className="text-sky-100">{flight!.flightNumber} • {flight!.class}</div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sky-100 text-xs">Depart</div>
                    <div className="text-xl font-bold">{flight!.departureTime}</div>
                    <div className="text-sky-100 text-sm inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {flight!.from}
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/25 grid place-items-center">
                    <Plane className="h-5 w-5 -rotate-90" />
                  </div>
                  <div>
                    <div className="text-sky-100 text-xs">Arrive</div>
                    <div className="text-xl font-bold">{flight!.arrivalTime}</div>
                    <div className="text-sky-100 text-sm inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {flight!.to}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stepper */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
            <ol className="flex items-center gap-3 text-sm">
              <StepDot active={step >= 1} label="Review" />
              <div className="h-px flex-1 bg-slate-200" />
              <StepDot active={step >= 2} label="Seats" />
              <div className="h-px flex-1 bg-slate-200" />
              <StepDot active={step >= 3} label="Payment" />
            </ol>
          </div>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Content per step */}
              <div className="lg:col-span-2 space-y-6">
                {step === 1 && <ReviewCard flight={flight!} onContinue={() => setStep(2)} />}

                {step === 2 && (
                  <SeatCard
                    seatMap={seatMap}
                    selected={selectedSeats}
                    toggleSeat={toggleSeat}
                    onSkip={() => goPayment()}
                    onContinue={() => goPayment()}
                  />
                )}

                {step === 3 && (
                  <PaymentCard
                    flight={flight!}
                    selected={selectedSeats}
                    seatTotal={seatTotal}
                    onBackToSeats={() => setStep(2)}
                    onPay={() => alert("Payment success (demo)")}
                  />
                )}

                {/* Policies always visible */}
                <Card>
                  <CardTitle icon={<ShieldCheck className="h-4 w-4" />}>Policies</CardTitle>
                  <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>Free cancellation within 24 hours of booking.</li>
                    <li>Changes subject to airline rules and fare difference.</li>
                    <li>Passport & visa requirements apply for international routes.</li>
                  </ul>
                </Card>
              </div>

              {/* Right: Fare box (sticky) */}
              <div className="lg:col-span-1">
                <div className="rounded-3xl border border-sky-100 bg-white shadow-sm p-6 lg:sticky lg:top-6">
                  <div className="text-slate-500 text-sm">Selected fare</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">
                    USD {flight!.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-500">per person</div>

                  {step >= 2 && (
                    <div className="mt-4 rounded-2xl bg-sky-50 border border-sky-100 p-4">
                      <div className="text-sm font-semibold text-slate-900">Seats</div>
                      {selectedSeats.length === 0 ? (
                        <div className="text-sm text-slate-600 mt-1">No seat selected.</div>
                      ) : (
                        <ul className="mt-1 text-sm text-slate-700 space-y-1">
                          {selectedSeats.map((s) => (
                            <li key={s.id} className="flex justify-between">
                              <span>Seat {s.id}</span>
                              <span>{s.price > 0 ? `+$${s.price}` : "Free"}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="h-px my-2 bg-slate-200" />
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>Seat total</span>
                        <span>${seatTotal}</span>
                      </div>
                    </div>
                  )}

                  {/* CTA reflect step */}
                  {step === 1 && (
                    <button
                      onClick={() => setStep(2)}
                      className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
                    >
                      Continue (choose seats)
                    </button>
                  )}
                  {step === 2 && (
                    <button
                      onClick={goPayment}
                      className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
                    >
                      Continue to payment
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      onClick={() => alert("Payment success (demo)")}
                      className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
                    >
                      Pay now
                    </button>
                  )}

                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                      className="mt-3 w-full h-11 rounded-xl border border-sky-200 text-sky-700 font-bold hover:bg-sky-50"
                    >
                      {step === 3 ? "Back to seats" : "Back to review"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

/* ========================= Subcomponents ========================= */

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={[
          "h-6 w-6 rounded-full grid place-items-center text-xs",
          active ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600",
        ].join(" ")}
      >
        {active ? <CheckCircle2 className="h-4 w-4" /> : <span>•</span>}
      </span>
      <span className={active ? "font-semibold text-slate-900" : "text-slate-500"}>{label}</span>
    </li>
  );
}

function ReviewCard({ flight, onContinue }: { flight: Flight; onContinue: () => void }) {
  return (
    <Card>
      <CardTitle icon={<Info className="h-4 w-4" />}>Review your flight</CardTitle>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoTile
          title="Departure"
          primary={flight.departureTime}
          secondary={
            <span className="inline-flex items-center gap-1 text-slate-600">
              <MapPin className="h-4 w-4" /> {flight.from}
            </span>
          }
        />
        <InfoTile
          title="Duration"
          icon={<Clock className="h-4 w-4" />}
          primary={flight.duration}
          secondary={flight.stops}
        />
        <InfoTile
          title="Arrival"
          alignRight
          primary={flight.arrivalTime}
          secondary={
            <span className="inline-flex items-center gap-1 text-slate-600">
              <MapPin className="h-4 w-4" /> {flight.to}
            </span>
          }
        />
      </div>

      <div className="mt-6 rounded-2xl bg-sky-50 border border-sky-100 p-4 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="h-4 w-4 text-sky-600" />
          <span>Free 24h cancellation. Baggage: 1 x 23kg checked, 1 x 7kg cabin.</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button
          onClick={onContinue}
          className="px-6 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
        >
          Choose seats
        </button>
      </div>
    </Card>
  );
}

function SeatCard({
  seatMap,
  selected,
  toggleSeat,
  onSkip,
  onContinue,
  pax = 1,                        // ✨ nhận pax
}: {
  seatMap: Seat[];
  selected: Seat[];
  toggleSeat: (s: Seat) => void;
  onSkip: () => void;
  onContinue: () => void;
  pax?: number;
}) {
  const [hint, setHint] = useState<string>("");

  // Gom hàng như cũ
  const rows = useMemo(() => {
    const by: Record<number, Seat[]> = {};
    seatMap.forEach((s) => {
      by[s.row] ??= [];
      by[s.row].push(s);
    });
    Object.values(by).forEach((arr) => arr.sort((a, b) => a.col.localeCompare(b.col)));
    return Object.entries(by)
      .map(([k, v]) => ({ row: Number(k), seats: v }))
      .sort((a, b) => a.row - b.row);
  }, [seatMap]);

  const isSelected = (id: string) => selected.some((s) => s.id === id);
  const isExitRow = (r: number) => r === 10 || r === 11;

  // Bộ chọn có kiểm soát số lượng
  const tryToggle = (s: Seat) => {
    if (s.type === "occupied") return;
    const exists = isSelected(s.id);
    if (!exists && selected.length >= pax) {
      setHint(`Bạn chỉ có thể chọn tối đa ${pax} ghế.`);
      // xoá hint sau 2s
      setTimeout(() => setHint(""), 2000);
      return;
    }
    toggleSeat(s);
  };

  const selectedCount = selected.length;
  const canContinue = selectedCount === pax || selectedCount === 0; // cho tiếp tục (nếu thiếu ghế sẽ auto-assign free)

  return (
    <Card>
      <CardTitle>
        <span className="inline-flex items-center gap-2">
          <Plane className="h-4 w-4 -rotate-90" />
          Choose your seats
        </span>
      </CardTitle>

      {/* Legend dạng pill */}
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <LegendPill label="Available" className="bg-white border-slate-300" />
        <LegendPill label="Selected" className="bg-sky-600 text-white border-sky-600" />
        <LegendPill label="Occupied" className="bg-slate-300 text-slate-500 border-slate-300" />
        <LegendPill label="Extra legroom" className="bg-emerald-50 border-emerald-300" />
        <LegendPill label="Exit row" className="bg-amber-50 border-amber-300" />
        <LegendPill label="Aisle" className="bg-sky-50 border-sky-200" hollow />
      </div>

      {/* Đếm ghế & thông báo */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="font-semibold text-slate-900">
          Seats selected: <span className="text-sky-700">{selectedCount}</span> / {pax}
        </div>
        {hint && <div className="text-amber-700">{hint}</div>}
      </div>

      {/* ===== AIRPLANE ===== */}
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[760px] mx-auto">
          {/* Nose */}
          <div
            className="mx-auto w-[600px] h-10 rounded-b-[56px]"
            style={{
              background:
                "radial-gradient(140px 32px at 50% -12px, rgba(14,165,233,0.25), transparent 65%), linear-gradient(to bottom, #eef7ff, #ffffff)",
              boxShadow: "inset 0 1px 0 rgba(2,132,199,.25)",
            }}
          />
          {/* Fuselage */}
          <div
            className="relative mx-auto w-[600px] rounded-[56px] border border-sky-100"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(247,250,252,1) 100%)",
              boxShadow:
                "inset 0 10px 20px rgba(2,132,199,.06), 0 8px 20px rgba(2,132,199,.05)",
            }}
          >
            {/* Wings */}
            <div className="absolute -left-32 top-28 w-44 h-28 rotate-[10deg] bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl shadow border border-sky-100 hidden md:block" />
            <div className="absolute -right-32 top-32 w-44 h-28 -rotate-[10deg] bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl shadow border border-sky-100 hidden md:block" />

            {/* EXIT labels */}
            <div className="absolute left-2 top-[220px] text-[10px] text-amber-600 font-semibold">EXIT</div>
            <div className="absolute right-2 top-[220px] text-[10px] text-amber-600 font-semibold">EXIT</div>
            <div className="absolute left-2 top-[260px] text-[10px] text-amber-600 font-semibold">EXIT</div>
            <div className="absolute right-2 top-[260px] text-[10px] text-amber-600 font-semibold">EXIT</div>

            {/* Cabin grid */}
            <div className="px-7 py-5">
              {/* Column headers */}
              <div className="grid grid-cols-[38px_repeat(3,1fr)_38px_repeat(3,1fr)_38px] gap-1 px-1 text-[11px] text-slate-500 mb-1">
                <div />
                <div className="text-center">A</div>
                <div className="text-center">B</div>
                <div className="text-center">C</div>
                <div className="text-center">┃</div>
                <div className="text-center">D</div>
                <div className="text-center">E</div>
                <div className="text-center">F</div>
                <div />
              </div>

              <div className="space-y-1">
                {rows.map(({ row, seats }) => (
                  <div
                    key={row}
                    className={[
                      "grid items-center grid-cols-[38px_repeat(3,1fr)_38px_repeat(3,1fr)_38px] gap-1",
                      isExitRow(row) ? "relative" : "",
                    ].join(" ")}
                  >
                    {/* row index left */}
                    <div className="text-[11px] text-slate-500 text-right pr-1">{row}</div>

                    {/* ABC */}
                    {seats.slice(0, 3).map((s) => (
                      <SeatBtn key={s.id} seat={s} active={isSelected(s.id)} onClick={() => tryToggle(s)} />
                    ))}

                    {/* AISLE thicker */}
                    <div className="h-9 flex items-stretch justify-center">
                      <div className="h-9 w-[4px] bg-sky-100 rounded" />
                    </div>

                    {/* DEF */}
                    {seats.slice(3, 6).map((s) => (
                      <SeatBtn key={s.id} seat={s} active={isSelected(s.id)} onClick={() => tryToggle(s)} />
                    ))}

                    {/* row index right */}
                    <div className="text-[11px] text-slate-500 pl-1">{row}</div>

                    {/* Exit highlight overlay */}
                    {isExitRow(row) && (
                      <div className="absolute inset-x-9 h-9 border-2 border-amber-300/70 rounded-md pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>

              {/* Facilities */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-[11px] text-slate-500">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                  Lavatory
                </div>
                <div />
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                  Galley
                </div>
              </div>
            </div>
          </div>

          {/* Tail */}
          <div
            className="mx-auto w-[520px] h-12 -mt-1 rounded-t-[56px]"
            style={{
              background:
                "radial-gradient(140px 30px at 50% 120%, rgba(14,165,233,0.15), transparent 70%), linear-gradient(to top, #eef7ff, #ffffff)",
              boxShadow: "inset 0 -1px 0 rgba(2,132,199,.2)",
            }}
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onSkip}
          className="h-11 px-4 rounded-xl border-2 border-sky-200 text-sky-700 font-bold hover:bg-sky-50"
        >
          Skip seat selection (assign remaining free)
        </button>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={[
            "h-11 px-6 rounded-xl font-bold text-white",
            "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600",
            !canContinue ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {selectedCount < pax && selectedCount > 0
            ? `Continue (${selectedCount}/${pax})`
            : "Continue to payment"}
        </button>
      </div>
    </Card>
  );
}







/* ========== UI bits ========== */

function SeatBtn({ seat, active, onClick }: { seat: Seat; active: boolean; onClick: () => void; }) {
  const base = "h-9 rounded-md border text-xs font-medium grid place-items-center select-none transition-colors";
  let cls = base;
  if (seat.type === "occupied") cls += " bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed";
  else if (active) cls += " bg-sky-600 text-white border-sky-600";
  else if (seat.type === "exit") cls += " bg-amber-50 border-amber-300 hover:bg-amber-100";
  else if (seat.type === "extra") cls += " bg-emerald-50 border-emerald-300 hover:bg-emerald-100";
  else cls += " bg-white border-slate-300 hover:bg-sky-50";

  return (
    <button className={cls} onClick={onClick} disabled={seat.type === "occupied"}>
      <div className="leading-none">{seat.id}</div>
      {seat.price > 0 && <div className="text-[10px] leading-none text-slate-500">${seat.price}</div>}
    </button>
  );
}

function LegendPill({ label, className, hollow }: { label: string; className: string; hollow?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-slate-700 ${className}`}>
      <span className={`h-3 w-3 rounded-sm ${hollow ? "border border-sky-200 bg-transparent" : "border-transparent"}`} />
      {label}
    </span>
  );
}

function PaymentCard({
  flight,
  selected,
  seatTotal,
  onBackToSeats,
  onPay,
}: {
  flight: Flight;
  selected: Seat[];
  seatTotal: number;
  onBackToSeats: () => void;
  onPay: () => void;
}) {
  const base = Math.round(flight.price * 0.85);
  const tax = Math.round(flight.price * 0.15);

  return (
    <Card>
      <CardTitle icon={<Ticket className="h-4 w-4" />}>Payment</CardTitle>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fare breakdown */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
          <div className="text-sm font-semibold text-slate-900">Fare summary</div>
          <div className="mt-2 text-sm text-slate-700 space-y-1">
            <Row label="Base fare" value={`$${base}`} />
            <Row label="Taxes & fees" value={`$${tax}`} />
            {selected.length > 0 && (
              <Row label={`Seats (${selected.map((s) => s.id).join(", ")})`} value={`$${seatTotal}`} />
            )}
            <div className="h-px my-2 bg-slate-200" />
            <Row
              label="Total"
              value={`USD ${(base + tax + seatTotal).toFixed(2)}`}
              bold
            />
          </div>
        </div>

        {/* Payment form (mock) */}
        <div className="rounded-2xl border border-sky-100 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">Card details</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <input className="h-11 rounded-xl border border-sky-200 px-3" placeholder="Cardholder name" />
            <input className="h-11 rounded-xl border border-sky-200 px-3" placeholder="Card number" />
            <div className="grid grid-cols-2 gap-3">
              <input className="h-11 rounded-xl border border-sky-200 px-3" placeholder="MM/YY" />
              <input className="h-11 rounded-xl border border-sky-200 px-3" placeholder="CVC" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={onBackToSeats}
              className="h-11 px-4 rounded-xl border-2 border-sky-200 text-sky-700 font-bold hover:bg-sky-50"
            >
              Back to seats
            </button>
            <button
              onClick={onPay}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
            >
              Pay now
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-sky-100 bg-white shadow-sm p-6">{children}</div>;
}

function CardTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-slate-900 font-semibold">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function InfoTile({
  title,
  primary,
  secondary,
  icon,
  alignRight,
}: {
  title: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  icon?: React.ReactNode;
  alignRight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className={`mt-1 text-xl font-bold ${alignRight ? "text-right" : ""}`}>
        {primary}
      </div>
      <div className={`mt-1 text-sm text-slate-600 flex items-center gap-2 ${alignRight ? "justify-end" : ""}`}>
        {icon}
        {secondary}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
