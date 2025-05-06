"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/utils/cn";
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";

// Create context for the card hover state
const MouseEnterContext = createContext<{
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}>({
  mouseX: {} as MotionValue<number>,
  mouseY: {} as MotionValue<number>,
});

export const CardContainer = ({
  children,
  className,
  containerClassName,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Motion values for smooth animations
  const _mouseX = useMotionValue(0);
  const _mouseY = useMotionValue(0);

  // Springs for smoother motion
  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(_mouseX, springConfig);
  const springY = useSpring(_mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate rotation based on mouse position
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to normalized -0.5 to 0.5 range for rotation
    const normalizedX = (mouseX / width) - 0.5;
    const normalizedY = (mouseY / height) - 0.5;
    
    setMouseX(normalizedX);
    setMouseY(normalizedY);
    _mouseX.set(normalizedX);
    _mouseY.set(normalizedY);
  };

  return (
    <MouseEnterContext.Provider value={{ mouseX: springX, mouseY: springY }}>
      <div
        className={cn("perspective-1000px", containerClassName)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setMouseX(0);
          setMouseY(0);
          _mouseX.set(0);
          _mouseY.set(0);
        }}
        onClick={onClick} 
      >
        <div
          className={cn(
            "relative transform-gpu",
            className
          )}
          style={{
            transform: `rotateX(${mouseY * 20}deg) rotateY(${mouseX * -20}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; 
}) => {
  return (
    <div className={cn("h-full w-full", className)} style={style}>
      {children}
    </div>
  );
};

export const CardItem = ({
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  as?: React.ElementType;
}) => {
  const { mouseX, mouseY } = useContext(MouseEnterContext);
  
  const rotateXValue = useTransform(mouseY, [-0.5, 0.5], [rotateX * -1, rotateX]);
  const rotateYValue = useTransform(mouseX, [-0.5, 0.5], [rotateY, rotateY * -1]);

  const style = {
    transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateXValue}deg) rotateY(${rotateYValue}deg) rotateZ(${rotateZ}deg)`,
    transition: "transform 0.1s ease-out",
  };

  return (
    <motion.div
      style={style}
      className={cn("", className)}
    >
      <Tag>{children}</Tag>
    </motion.div>
  );
};