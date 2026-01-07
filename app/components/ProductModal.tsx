'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Image from 'next/image';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ isOpen, onClose }: ProductModalProps) {
  const kitItems = [
    '1x Macro Lens (Universal)',
    '30x Hydrocolloid Patches',
    '10x Sterile Lancets',
    '1x Matte Black Tin',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Product Image */}
                <div className="relative aspect-square bg-gray-200 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden">
                  <Image
                    src="/breach-kit.png"
                    alt="Twacha Breach Kit"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Right: Product Details */}
                <div className="p-8 md:p-10 flex flex-col">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Header */}
                  <h2
                    className="text-3xl md:text-4xl font-bold text-[#1E3A2F] mb-4 pr-8"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Twacha Breach Kit [Founder's Edition]
                  </h2>

                  {/* Kit Items List */}
                  <div className="space-y-3 mb-8 flex-1">
                    {kitItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#1E3A2F] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[#1E3A2F] font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <span className="text-4xl font-bold text-[#1E3A2F]">£24.00</span>
                  </div>

                  {/* CTA Button */}
                  <motion.a
                    href="https://buy.stripe.com/bJe5kDgMTcdd5WpfdA24000"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full bg-[#1E3A2F] text-white font-semibold py-4 rounded-full text-center hover:bg-[#1E3A2F]/90 transition-all shadow-lg text-lg"
                  >
                    Proceed to Checkout
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
