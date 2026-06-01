'use client';

import React, { useState, useEffect, useRef } from 'react';
import posthog from 'posthog-js';

const CARDS = [
  {
    id: 7,
    image: '/hedge-funds.jpg',
    title: 'Hedge Funds',
    paragraph:
      "We provide niche hedge fund strategies and customized solutions across the liquidity spectrum to help investors achieve their strategic investment objectives, leveraging the scale of J.P. Morgan's platform to secure scarce capacity and negotiate competitive terms.",
    stats: [
      { value: '$26B', label: 'in assets under management' },
      { value: '30', label: 'years managing hedge fund strategies' },
      { value: '100+', label: 'dedicated professionals globally' },
    ],
  },
  {
    id: 1,
    image: '/infrastructure.jpg',
    title: 'Infrastructure',
    paragraph:
      "Our team makes long-term investments across the world's largest core infrastructure markets, investing at scale in essential service assets to deliver core outcomes. We primarily target investments in contracted and regulated essential services.",
    stats: [
      { value: '$91B', label: 'in assets under management' },
      { value: '18', label: 'portfolio companies with over 1,000 assets' },
      { value: '19+', label: 'years of experience managing private infrastructure' },
    ],
  },
  {
    id: 5,
    image: '/private-credit.jpg',
    title: 'Private Credit',
    paragraph:
      'We have dedicated private credit professionals with extensive experience and specialized expertise. We offer a spectrum of private credit strategies and solutions to meet client objectives covering direct lending, private credit secondaries, and opportunistic special situations.',
    stats: [
      { value: '$22B', label: 'in assets under management' },
      { value: '65', label: 'years managing capital through cycles' },
      { value: '10+', label: 'strategies focused only on private credit' },
    ],
  },
  {
    id: 4,
    image: '/private-equity.jpg',
    title: 'Private Equity',
    paragraph:
      'A bottom-up, opportunistic investment approach seeking the highest conviction ideas from venture to buyout across primaries, secondaries and co-investments with a focus on the small-mid market.',
    stats: [
      { value: '$37B', label: 'in assets under management' },
      { value: '45+', label: "years' experience" },
      { value: '260+', label: 'GP relationships' },
    ],
  },
  {
    id: 3,
    image: '/timberland.jpg',
    title: 'Timberland',
    paragraph:
      'We manage a timberland investment strategy for investors looking for portfolio diversification, inflation risk management and income benefits of investing in forestlands, while also capturing carbon and generating verified carbon assets (VCAs).',
    stats: [
      { value: '$11B', label: 'in assets under management' },
      { value: '1.5M+', label: 'acres under management across three continents' },
      { value: '40+', label: 'years of experience in timberland management' },
    ],
  },
  {
    id: 2,
    image: '/transport.jpg',
    title: 'Transport',
    paragraph:
      'We manage income-oriented investments targeting large, supply-chain-critical assets with long duration leases and inflation protection mechanisms.',
    stats: [
      { value: '$14B', label: 'in assets under management' },
      { value: '150+', label: 'investments' },
      { value: '15+', label: 'years managing transport' },
    ],
  },
  {
    id: 6,
    image: '/real-estate.jpg',
    title: 'Real Estate',
    paragraph:
      'Our platform delivers a distinct information advantage through deep market expertise and comprehensive data insights. We employ a disciplined, integrated investment process that encourages innovation and enables us to invest across the full real estate risk spectrum.',
    stats: [
      { value: '$71B', label: 'of assets under management' },
      { value: '65', label: 'years managing real estate strategies' },
      { value: '67', label: 'markets and 365+ investments' },
    ],
  },
];

const AUTOPLAY_DELAY = 10000;

export default function App() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  // Window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer effect
  useEffect(() => {
    clearTimer();
    if (autoPlayEnabled) {
      // Sequential autoplay: advance every 10s
      timerRef.current = setTimeout(() => {
        setActiveCard(prev => prev === null ? 0 : (prev + 1) % CARDS.length);
      }, AUTOPLAY_DELAY);
    } else {
      // Autoplay OFF: after 15s idle, close any open card back to default
      timerRef.current = setTimeout(() => {
        setActiveCard(null);
      }, 15000);
    }
    return clearTimer;
  }, [autoPlayEnabled, activeCard]);

  const handleCardClick = (index: number) => {
    const isActive = activeCard === index;
    if (!isActive) {
      posthog.capture('card_click', { card: CARDS[index].title });
    }
    setActiveCard(isActive ? null : index);
  };

  const toggleAutoPlay = () => {
    const turningOff = autoPlayEnabled;
    setAutoPlayEnabled(prev => !prev);
    if (turningOff) {
      setActiveCard(null);
    } else {
      setActiveCard(0); // begin autoplay immediately from card 1
    }
  };

  // Prevent render before dimensions are acquired to avoid layout flash
  if (dimensions.width === 0) {
    return <div className="w-screen h-screen bg-black" />;
  }

  // Core calculations based on window dimensions.
  // Bar heights scale proportionally so smaller screens still expose the card area.
  // At 1920×1080: topBarHeight=250, bottomBarHeight=150, cardTop=200, cardHeight=780 — identical to prior hardcoded values.
  const topBarHeight = Math.min(250, Math.max(80, dimensions.height * 0.25));
  const bottomBarHeight = Math.min(150, Math.max(50, dimensions.height * 0.15));
  const cardTop = Math.round(topBarHeight * 0.8);
  const cardHeight = Math.max(150, dimensions.height - cardTop - bottomBarHeight + 50);
  const defaultCardWidth = dimensions.width / CARDS.length;
  const activeCardWidth = Math.min(cardHeight, dimensions.width);
  // Matches the logo's horizontal centering margin for toggle alignment
  const logoWidth = Math.min(dimensions.width * 0.85, 1500);
  const logoHorizontalMargin = (dimensions.width - logoWidth) / 2;

  // Content scale: compress more aggressively on very short cards (landscape mobile)
  const backScaleValue = (() => {
    if (dimensions.width >= 1300) return 1;
    if (dimensions.width < 768) return 1;
    return cardHeight < 350 ? 0.55 : 0.7;
  })();
  // Wrapper is wider than the card so that after scale() it visually fills edge-to-edge (scaled range only)
  const backContentWrapperWidth = activeCardWidth / backScaleValue;
  // Absolute close X for large screens (≥1300) — aligns with lg:px-12 content padding
  const closeXRight = dimensions.width >= 1300 ? 48 : 0;

  // Calculate the "gravitational center" group offset to center active card without gaps
  let groupOffset = 0;
  if (activeCard !== null) {
    const totalW = (CARDS.length - 1) * defaultCardWidth + activeCardWidth;
    const activeRelativeLeft = activeCard * defaultCardWidth;
    const activeCenterRel = activeRelativeLeft + (activeCardWidth / 2);
    const idealOffset = (dimensions.width / 2) - activeCenterRel;

    let maxOffset = 0; // Group's left edge cannot go right of 0
    let minOffset = dimensions.width - totalW; // Group's right edge cannot go left of viewport width
    
    // Fallback just in case the screen is wildly wide and the cards don't fill it
    if (minOffset > maxOffset) {
      minOffset = (dimensions.width - totalW) / 2;
      maxOffset = minOffset;
    }

    // Clamp the offset so it gets as close to ideal as possible without showing gaps
    groupOffset = Math.max(minOffset, Math.min(maxOffset, idealOffset));
  }

  // Extremely fluid, cinematic easing curve (smooth ease-out without the hard bounce)
  const physicsBezier = 'cubic-bezier(0.25, 1, 0.2, 1)';

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none font-sans text-white">
      
      {/* Top Fixed Element */}
      <div
        className="fixed top-0 left-0 w-full pointer-events-none z-[100]"
        style={{
          height: `${topBarHeight}px`,
          filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.8))',
          WebkitFilter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.8))'
        }}
      >
        <div 
          className="w-full h-full flex items-center justify-center"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/top-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 0% 100%)',
            WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 0% 100%)'
          }}
        >
          <img src="/logo.svg" alt="Logo" className="w-[85%] max-w-[1500px] h-auto" />
        </div>
      </div>

      {/* Main 3D Context Container */}
      <div 
        className="relative w-full h-full" 
        style={{ 
          perspective: '1200px',
          WebkitPerspective: '1200px'
        }} 
      >
        {CARDS.map((card, index) => {
          const isActive = activeCard === index;
          const isFlipped = isActive;
          
          let leftPosition = 0;
          let cardWidth = defaultCardWidth;

          // Calculate precise X coordinates based on gravitational centering
          if (activeCard === null) {
            leftPosition = index * defaultCardWidth;
          } else {
            let relativeLeft = 0;
            
            // Calculate where this card sits relative to the start of the card group
            if (index < activeCard) {
              relativeLeft = index * defaultCardWidth;
              cardWidth = defaultCardWidth;
            } else if (index === activeCard) {
              relativeLeft = index * defaultCardWidth;
              cardWidth = activeCardWidth;
            } else {
              relativeLeft = (activeCard * defaultCardWidth) + activeCardWidth + ((index - activeCard - 1) * defaultCardWidth);
              cardWidth = defaultCardWidth;
            }
            
            // Apply the clamped group offset to position it on screen
            leftPosition = groupOffset + relativeLeft;
          }

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="absolute cursor-pointer"
              style={{
                top: `${cardTop}px`,
                left: `${leftPosition}px`,
                width: `${cardWidth + 1}px`, // +1px to prevent fractional sub-pixel gaps between cards
                height: `${cardHeight}px`,
                zIndex: isActive ? 40 : 10,
                // Apply the highly fluid ease and doubled 2.4s duration
                transition: `all 2.4s ${physicsBezier}`,
                WebkitTransition: `all 2.4s ${physicsBezier}`
              }}
            >
              {/* Inner 3D Flip Wrapper */}
              <div
                className="w-full h-full relative"
                style={{
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  // The flip animation with a slight scale increase when active
                  transform: isFlipped ? 'rotateY(180deg) scale(1.05)' : 'rotateY(0deg) scale(1)',
                  WebkitTransform: isFlipped ? 'rotateY(180deg) scale(1.05)' : 'rotateY(0deg) scale(1)',
                  // Sharp, realistic elevation drop shadow only when active
                  boxShadow: isActive ? '0 30px 60px -15px rgba(0,0,0,0.8), 0 20px 30px -10px rgba(0,0,0,0.6)' : 'none',
                  WebkitBoxShadow: isActive ? '0 30px 60px -15px rgba(0,0,0,0.8), 0 20px 30px -10px rgba(0,0,0,0.6)' : 'none',
                  transition: `transform 2.4s ${physicsBezier}, box-shadow 2.4s ${physicsBezier}`,
                  WebkitTransition: `-webkit-transform 2.4s ${physicsBezier}, -webkit-box-shadow 2.4s ${physicsBezier}`
                }}
              >
                {/* --- FRONT SIDE --- */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    // WebKit iOS fix: explicit Z-layering to prevent bleed-through
                    transform: 'translateZ(1px)',
                    WebkitTransform: 'translateZ(1px)',
                  }}
                >
                  {/* Bottom-to-center transparent black gradient */}
                  <div 
                    className="absolute inset-0 pointer-events-none" 
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 50%)' }}
                  />
                  <div 
                    className="absolute left-0 w-full flex flex-col items-center pointer-events-none"
                    style={{ 
                      top: dimensions.width < 1300 ? 'calc(100% - 150px)' : 'calc(100% - 200px)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <h2
                      className="relative z-10 font-book text-center text-[10px] md:text-[1.75vw] md:leading-[1.75vw] px-4 py-2"
                      style={{
                        writingMode: dimensions.width < 768 && !isActive ? 'vertical-rl' : 'horizontal-tb',
                        WebkitWritingMode: dimensions.width < 768 && !isActive ? 'vertical-rl' : 'horizontal-tb',
                        transform: dimensions.width < 768 && !isActive ? 'rotate(180deg) translateZ(0)' : 'translateZ(0)',
                        WebkitTransform: dimensions.width < 768 && !isActive ? 'rotate(180deg) translateZ(0)' : 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      {card.title}
                    </h2>
                    {/* + circle icon */}
                    <svg
                      width="40" height="40" viewBox="0 0 40 40"
                      fill="none" xmlns="http://www.w3.org/2000/svg"
                      style={{ marginTop: '25px', flexShrink: 0 }}
                    >
                      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="2"/>
                      <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* --- BACK SIDE --- */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    // WebKit iOS fix: positive translateZ on the flipped face ensures proper depth sorting
                    transform: 'rotateY(180deg) translateZ(1px)',
                    WebkitTransform: 'rotateY(180deg) translateZ(1px)',
                  }}
                >
                  {/* Backdrop blur with 50% transparent black tint */}
                  <div 
                    className="absolute inset-0 bg-black/50 pointer-events-none" 
                    style={{
                      backdropFilter: 'blur(9px)',
                      WebkitBackdropFilter: 'blur(9px)'
                    }}
                  />
                  
                  {/* To create a perfectly real "printed" effect, we constrain the inner content 
                    to the exact size it will be when fully open. As the card width animates, 
                    this div stays rigid and is simply clipped by the parent's overflow, 
                    creating the illusion of a solid card rotating. No fading allowed!
                  */}
                  <div 
                    className="absolute top-0 left-1/2 h-full flex flex-col justify-center pointer-events-none"
                    style={{
                      width: `${backContentWrapperWidth}px`,
                      transform: `translateX(-50%) scale(${backScaleValue})`,
                      WebkitTransform: `translateX(-50%) scale(${backScaleValue})`
                    }}
                  >
                    <div className="w-full text-left px-2 md:px-3 lg:px-12">
                      {/* Large screens: absolute X top-right; scaled range: inline with title */}
                      {dimensions.width >= 1300 && (
                        <div className="absolute top-16 md:top-20 text-white opacity-80 z-50" style={{ right: `${closeXRight}px` }}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-4 md:mb-6">
                        <h3 className="text-lg md:text-xl xl:text-3xl text-white">
                          {card.title}
                        </h3>
                        {dimensions.width < 1300 && (
                          <div className="text-white opacity-80 shrink-0 ml-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-white/90 text-xs md:text-sm xl:text-lg mb-5 md:mb-6">
                        {card.paragraph}
                      </p>

                      {/* Stats Grid - 3 columns, always side-by-side. */}
                      <div className="grid grid-cols-3 gap-3 md:gap-6 w-full">
                        {card.stats.map((stat, i) => (
                          <div key={i} className={`p-2 sm:p-4 ${i === 0 ? 'pl-0 sm:pl-0' : ''}`}>
                            {/* Two stacked strokes: black full-width base, blue 50% on top */}
                            <div className="relative w-full" style={{ height: '2px', marginBottom: '20px' }}>
                              <div className="absolute inset-0 bg-black" />
                              <div className="absolute left-0 top-0 h-full w-1/2" style={{ backgroundColor: '#52d8e6' }} />
                            </div>
                            <div className="text-2xl md:text-3xl xl:text-4xl text-white mb-1">{stat.value}</div>
                            <div className="font-book text-[10px] md:text-xs xl:text-sm text-white/70">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Disclaimer Text */}
                      <div className="font-book mt-4 md:mt-6 text-[10px] xl:text-xs text-white/50 tracking-wide">
                        All data as of 12/31/2025
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Fixed Element */}
      <div
        className="fixed bottom-0 left-0 w-full pointer-events-none z-[100]"
        style={{
          height: `${bottomBarHeight}px`,
          filter: 'drop-shadow(0 -15px 15px rgba(0,0,0,0.8))',
          WebkitFilter: 'drop-shadow(0 -15px 15px rgba(0,0,0,0.8))'
        }}
      >
        <div
          className="w-full h-full"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/bottom-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: 'polygon(100% 100%, 0% 100%, 0% 30%, 100% 0%)',
            WebkitClipPath: 'polygon(100% 100%, 0% 100%, 0% 30%, 100% 0%)'
          }}
        />
        {/* Bottom bar: legal + disclosure + autoplay toggle */}
        <div
          className="absolute inset-0 flex items-center justify-end"
          style={{ paddingRight: `${logoHorizontalMargin}px` }}
        >
          <div className="flex items-center pointer-events-auto">
            {/* Legal line — hidden on narrow screens to avoid overflow */}
            {dimensions.width >= 600 && (
              <span className="font-book text-xs sm:text-sm text-white whitespace-nowrap">
                © JPMorgan Chase &amp; Co. 2026
              </span>
            )}
            {/* Disclosure button */}
            <button
              onClick={() => setShowDisclosure(true)}
              className="font-book text-xs sm:text-sm text-white whitespace-nowrap"
              style={{
                marginLeft: '20px',
                border: '1px solid white',
                padding: '2px 8px',
                display: 'inline-block',
                background: 'none',
              }}
            >
              Disclosure
            </button>
            {/* Divider before autoplay toggle */}
            <div style={{ marginLeft: '20px', marginRight: '20px', borderRight: '2px solid white', alignSelf: 'stretch' }} />
            {/* Autoplay toggle */}
            <button
              onClick={toggleAutoPlay}
              className="flex items-center gap-2 text-white"
            >
              <span className="font-book text-xs sm:text-sm">Autoplay</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${autoPlayEnabled ? 'bg-white' : 'bg-white/30'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-300 ${autoPlayEnabled ? 'bg-black translate-x-5' : 'bg-white translate-x-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Disclosure Modal */}
      {showDisclosure && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowDisclosure(false)}
        >
          <div
            className="bg-white text-black rounded-sm max-w-lg w-full p-8 relative"
            style={{ boxShadow: '0 0 0 20px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDisclosure(false)}
              className="absolute top-4 right-4 text-black opacity-50 hover:opacity-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 className="text-2xl mb-4 font-book">Disclosure</h2>
            <p className="text-sm leading-relaxed mb-4 font-book">
              Investing in alternative assets entails risks distinct from traditional investments. These include limited liquidity, less transparent valuations, higher volatility, and regulatory, operational, or manager-specific risks, including potential loss of principal. Investors should carefully assess these risks and their objectives before investing.
            </p>
            <p className="text-sm leading-relaxed font-book">
              J.P. Morgan Asset Management is the marketing name for the asset management business of JPMorgan Chase &amp; Co., and its affiliates worldwide
            </p>
          </div>
        </div>
      )}

    </div>
  );
}