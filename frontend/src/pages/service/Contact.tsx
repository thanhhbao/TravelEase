import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { contactSupport } from '../../lib/api';
import {
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  Loader2
} from 'lucide-react';

export default function Contact() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      await contactSupport(formData);
      setSubmitStatus({
        type: 'success',
        message: 'Your message has been sent successfully! We\'ll get back to you soon.'
      });
      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = [
    'General Inquiry',
    'Booking Support',
    'Refund Request',
    'Technical Issue',
    'Feedback',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-sky-200 bg-white/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white mb-4 shadow-lg">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              Contact Support
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We're here to help! Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-sky-200 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-sm text-slate-600">support@travelease.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Live Chat</p>
                    <p className="text-sm text-slate-600">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Response Time</p>
                    <p className="text-sm text-slate-600">Within 2 hours</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-sky-50 border border-sky-200">
                <p className="text-sm text-slate-700">
                  <strong>Quick Tip:</strong> For urgent booking issues, please include your booking reference number in your message.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-sky-200 bg-white p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status Message */}
                {submitStatus.type && (
                  <div className={`p-4 rounded-xl border ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {submitStatus.type === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span className="font-medium">{submitStatus.message}</span>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">Select a subject</option>
                      {subjectOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum 10 characters. Please provide as much detail as possible.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-cyan-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
