"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side: Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary-container to-tertiary">
        <div className="relative z-10 p-margin-desktop flex flex-col justify-between h-full w-full">
          {/* Logo */}
          <div className="font-manrope text-headline-md font-bold text-white tracking-tight">
            Aykau
          </div>

          {/* Hero Content */}
          <div className="max-w-md">
            <h1 className="text-white font-manrope text-display-lg font-bold mb-4">
              Build your dream team.
            </h1>
            <p className="text-white/90 font-inter text-body-lg">
              The world's most talented artisans, ready to bring your vision to
              life.
            </p>
            <div className="mt-8 flex gap-4 items-center">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 backdrop-blur" />
              </div>
              <span className="text-white/80 font-inter text-label-sm">
                Joined by 10k+ creators
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/60 font-inter text-label-sm">
            © 2024 Aykau. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-bright">
        {/* Mobile Logo */}
        <div className="lg:hidden w-full max-w-md mb-8">
          <div className="font-manrope text-headline-md font-bold text-primary tracking-tight">
            Aykau
          </div>
        </div>

        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-manrope text-headline-lg font-semibold text-on-surface mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="font-inter text-body-md text-on-surface-variant">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
