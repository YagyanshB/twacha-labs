'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, Truck, Shield } from 'lucide-react';
import Image from 'next/image';

export default function ProductSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const kitItems = [
    '1x Universal 15x Macro Lens',
    '30x Hydrocolloid Patches (Matte)',
    '10x Sterile Lancets',
    '10x Alcohol Prep Pads',
    'Matte Black Carry Tin',
  ];

  return (
    <div ref={sectionRef} className="w-full py-20 md:py-32 bg-[#FDFBF7] px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square bg-gray-200 rounded-3xl overflow-hidden relative">
              {/* Placeholder for product photo - using the breach-kit.png if available */}
              <Image
                src="/breach-kit.png"
                alt="The Breach Kit"
                fill
                className="object-cover"
              />
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute top-4 right-4 bg-[#1E3A2F] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-10"
              >
                FOUNDER'S EDITION
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-bold text-[#1E3A2F]" style={{ fontFamily: 'var(--font-serif)' }}>
              The Breach Kit.
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-[#1E3A2F]/80 leading-relaxed">
              The complete tactical protocol. Clinical-grade hardware to stop scarring before it starts.
            </p>

            {/* Kit Items List */}
            <div className="space-y-3 pt-4">
              {kitItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#1E3A2F] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[#1E3A2F] font-medium">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* Buy Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mt-8"
            >
              {/* Price and Badge */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-3xl font-bold text-[#1E3A2F]">£24.00</span>
                </div>
                <span className="px-3 py-1 bg-[#D1FAE5] text-[#1E3A2F] rounded-full text-sm font-semibold">
                  Free Shipping
                </span>
              </div>

              {/* CTA Button */}
              <motion.a
                href="https://buy.stripe.com/bJe5kDgMTcdd5WpfdA24000"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full bg-[#1E3A2F] text-white font-semibold py-4 rounded-full text-center hover:bg-[#1E3A2F]/90 transition-all shadow-lg"
              >
                SECURE YOUR KIT
              </motion.a>

              {/* Trust Signals */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-[#1E3A2F]/70">
                  <Truck className="w-4 h-4" />
                  <span>Next Day Dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1E3A2F]/70">
                  <Shield className="w-4 h-4" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
