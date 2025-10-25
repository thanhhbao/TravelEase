import { useState } from "react";
import { 
  MessageCircle, 
  BookOpen, 
  Headphones, 
  Mail, 
  Phone, 
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Ticket,
  Hotel,
  Plane,
  Users,
  Shield,
  Star
} from "lucide-react";

export default function Services() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-sky-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              Customer Services
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Manage your bookings, get support, and enjoy seamless travel experiences
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Main Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* My Bookings Card */}
          <ServiceCard
            title="My Bookings"
            description="View, manage, and check-in to your flights and hotel reservations"
            icon={<BookOpen className="h-8 w-8" />}
            gradient="from-sky-500 to-cyan-500"
            link="/my/bookings"
            features={[
              "View all bookings",
              "Online check-in",
              "Download e-tickets",
              "Cancel bookings"
            ]}
            isHovered={hoveredCard === "bookings"}
            onHover={() => setHoveredCard("bookings")}
            onLeave={() => setHoveredCard(null)}
          />

          {/* Contact Support Card */}
          <ServiceCard
            title="Contact Support"
            description="Get help with your bookings, refunds, or any travel-related questions"
            icon={<Headphones className="h-8 w-8" />}
            gradient="from-emerald-500 to-teal-500"
            link="/service/contact"
            features={[
              "24/7 support",
              "Quick response",
              "Refund requests",
              "Service feedback"
            ]}
            isHovered={hoveredCard === "contact"}
            onHover={() => setHoveredCard("contact")}
            onLeave={() => setHoveredCard(null)}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            value="50K+"
            label="Happy Customers"
            color="from-sky-500 to-cyan-500"
          />
          <StatCard
            icon={<Ticket className="h-5 w-5" />}
            value="100K+"
            label="Bookings Completed"
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            value="99.9%"
            label="Success Rate"
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            icon={<Star className="h-5 w-5" />}
            value="4.9/5"
            label="Customer Rating"
            color="from-amber-500 to-orange-500"
          />
        </div>

        {/* Additional Services */}
        <div className="rounded-3xl border border-sky-200 bg-white p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Shield className="h-6 w-6 text-sky-600" />
            Other Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniServiceCard
              icon={<Hotel className="h-5 w-5" />}
              title="Hotels"
              description="Book luxury hotels worldwide"
              link="/hotels"
              available
            />
            <MiniServiceCard
              icon={<Plane className="h-5 w-5" />}
              title="Flights"
              description="Find best flight deals"
              link="/flights"
              available
            />
            <MiniServiceCard
              icon={<MapPin className="h-5 w-5" />}
              title="Car Rentals"
              description="Rent cars at your destination"
              link="/cars"
              available={false}
            />
            <MiniServiceCard
              icon={<Shield className="h-5 w-5" />}
              title="Travel Insurance"
              description="Protect your journey"
              link="/insurance"
              available={false}
            />
          </div>
        </div>

        {/* Quick Support Section */}
        <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white to-sky-50/50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Need Quick Help?
            </h2>
            <p className="text-slate-600">
              Our support team is available 24/7 to assist you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContactMethod
              icon={<Phone className="h-6 w-6" />}
              title="Phone Support"
              value="+84 909 123 456"
              description="Mon-Sun: 24/7"
              color="from-sky-500 to-cyan-500"
            />
            <ContactMethod
              icon={<Mail className="h-6 w-6" />}
              title="Email Support"
              value="support@travel.com"
              description="Response within 2 hours"
              color="from-emerald-500 to-teal-500"
            />
            <ContactMethod
              icon={<MessageCircle className="h-6 w-6" />}
              title="Live Chat"
              value="Chat with us"
              description="Available now"
              color="from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 rounded-3xl border border-sky-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-sky-600" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <FAQItem
              question="How do I check-in online?"
              answer="Go to My Bookings, select your booking, and click 'Check-in Online'. You'll receive a QR code to use at the airport or hotel."
            />
            <FAQItem
              question="What is your cancellation policy?"
              answer="Free cancellation within 24 hours of booking. After that, cancellation fees may apply based on the airline or hotel policy."
            />
            <FAQItem
              question="How do I get a refund?"
              answer="Contact our support team through the Contact Support page and select 'Refund Request'. We'll process it within 5-7 business days."
            />
            <FAQItem
              question="Can I modify my booking?"
              answer="Yes, go to My Bookings and select 'Modify Booking'. Changes are subject to availability and may incur additional fees."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ========= Components ========= */

function ServiceCard({
  title,
  description,
  icon,
  gradient,
  link,
  features,
  isHovered,
  onHover,
  onLeave,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  link: string;
  features: string[];
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <a
      href={link}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group relative rounded-3xl border-2 border-sky-200 bg-white p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-2"
    >
      {/* Gradient Border Effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative">
        {/* Icon */}
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-6 transition-transform group-hover:scale-110`}>
          {icon}
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm text-slate-700">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className={`inline-flex items-center gap-2 font-semibold text-transparent bg-clip-text bg-gradient-to-r ${gradient} group-hover:gap-4 transition-all`}>
          Get Started
          <ArrowRight className="h-5 w-5 text-sky-600" />
        </div>
      </div>
    </a>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-5 text-center hover:shadow-lg transition-shadow">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white mb-3 shadow-md`}>
        {icon}
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-1">
        {value}
      </div>
      <div className="text-sm text-slate-600 font-medium">
        {label}
      </div>
    </div>
  );
}

function MiniServiceCard({
  icon,
  title,
  description,
  link,
  available,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  available: boolean;
}) {
  const content = (
    <div className={`rounded-xl border-2 p-4 transition-all ${
      available
        ? "border-sky-200 bg-white hover:border-sky-400 hover:shadow-md cursor-pointer"
        : "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
    }`}>
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${
        available
          ? "bg-gradient-to-br from-sky-500 to-cyan-500 text-white"
          : "bg-slate-300 text-slate-500"
      }`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
      {!available && (
        <span className="inline-block mt-2 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Coming Soon
        </span>
      )}
    </div>
  );

  return available ? <a href={link}>{content}</a> : content;
}

function ContactMethod({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-6 text-center hover:shadow-lg transition-shadow">
      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sky-600 font-semibold mb-1">{value}</p>
      <p className="text-sm text-slate-600 flex items-center justify-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {description}
      </p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-sky-100/50 transition-colors"
      >
        <span className="font-semibold text-slate-900">{question}</span>
        <ArrowRight className={`h-5 w-5 text-sky-600 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}