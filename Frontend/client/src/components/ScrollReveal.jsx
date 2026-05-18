import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * ScrollReveal wrapper component
 * Progressively reveals sections as user scrolls into viewport
 * Applies fade + translate animations for smooth reveal
 */
export default function ScrollReveal({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up', // 'up', 'down', 'left', 'right'
}) {
  const [ref, isVisible] = useScrollReveal(0.15);

  // Determine initial position based on direction
  const getInitialPosition = () => {
    const positions = {
      up: { y: 60, x: 0 },
      down: { y: -60, x: 0 },
      left: { y: 0, x: 60 },
      right: { y: 0, x: -60 },
    };
    return positions[direction] || positions.up;
  };

  const initialPos = getInitialPosition();

  const variants = {
    hidden: {
      opacity: 0,
      ...initialPos,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad-like
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
