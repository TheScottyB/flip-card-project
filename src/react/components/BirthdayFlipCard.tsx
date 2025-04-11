import React, { useEffect, useRef, useState } from 'react';
import { initFlipCards } from '../../core/flip-card';
import './BirthdayFlipCard.css';

interface BirthdayFlipCardProps {
  recipientName: string;
  message: string;
  className?: string;
}

const BirthdayFlipCard: React.FC<BirthdayFlipCardProps> = ({
  recipientName,
  message,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([]);
  const [candleLit, setCandleLit] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      initFlipCards();
    }
  }, []);

  const handleBalloonPop = (index: number) => {
    if (!poppedBalloons.includes(index)) {
      setPoppedBalloons([...poppedBalloons, index]);
    }
  };

  const handleCandleClick = () => {
    setCandleLit(!candleLit);
  };

  return (
    <div className={`flip-card birthday-card ${className}`} ref={cardRef}>
      <div className="flip-card-inner">
        {/* Front of the card - Simple and clean */}
        <div className="flip-card-front celebration-template">
          <div className="content">
            <h1 className="header">Happy Birthday!</h1>
            <h2 className="recipient-name">{recipientName}</h2>
            <div className="cake">
              <div className="cake-base"></div>
              <div className="cake-top"></div>
              <div className={`cake-flame ${candleLit ? 'lit' : ''}`}></div>
            </div>
            <div className="flip-hint">Click to celebrate!</div>
          </div>
        </div>
        
        {/* Back of the card - Interactive elements */}
        <div className="flip-card-back celebration-template">
          <div className="celebration-bg">
            {[1, 2, 3].map((index) => (
              !poppedBalloons.includes(index) && (
                <div
                  key={index}
                  className={`balloon balloon-${index} interactive`}
                  onClick={() => handleBalloonPop(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Pop balloon ${index}`}
                >
                  <span className="balloon-string"></span>
                </div>
              )
            ))}
            <div className="floating-sunrise sunrise-1"></div>
            <div className="floating-sunrise sunrise-2"></div>
            <div className="sparkles">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
          <div className="content">
            <h2 className="recipient-name">{recipientName}</h2>
            <p className="message">{message}</p>
            <div 
              className="interactive-cake"
              onClick={handleCandleClick}
              role="button"
              tabIndex={0}
              aria-label={candleLit ? "Blow out candle" : "Light candle"}
            >
              <div className="cake-base"></div>
              <div className="cake-top"></div>
              <div className={`cake-flame ${candleLit ? 'lit' : ''}`}></div>
            </div>
            <div className="interaction-hints">
              <p>🎈 Pop the balloons!</p>
              <p>🕯️ {candleLit ? "Blow out" : "Light"} the candle!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayFlipCard; 