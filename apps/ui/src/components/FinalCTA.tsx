import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-display-sm md:text-display-md font-semibold tracking-tight mb-6">
            Try the demo in 30 seconds.
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8">
            No signup. No extension needed. Just see how it works.
          </p>
          
          <Link
            to="/demo"
            className="btn-pill-primary text-base px-10 py-4 inline-flex"
          >
            Open Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
