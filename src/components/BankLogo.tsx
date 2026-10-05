import React from 'react';

export type BankType = 'gcash' | 'maya' | 'bpi' | 'bdo' | 'unionbank' | 'seabank' | 'gotyme' | 'aub' | 'rcbc' | 'metrobank';

export const BANK_PRESETS: { id: BankType, name: string, color: string }[] = [
  { id: 'gcash', name: 'GCash', color: '#005CEE' },
  { id: 'maya', name: 'Maya', color: '#00B14F' },
  { id: 'bpi', name: 'BPI', color: '#B11116' },
  { id: 'bdo', name: 'BDO', color: '#002A86' },
  { id: 'unionbank', name: 'UnionBank', color: '#EE6F24' },
  { id: 'seabank', name: 'SeaBank', color: '#FF7000' },
  { id: 'gotyme', name: 'GoTyme', color: '#00A3A0' },
  { id: 'aub', name: 'AUB', color: '#E11D48' },
  { id: 'rcbc', name: 'RCBC', color: '#0054A6' },
  { id: 'metrobank', name: 'Metrobank', color: '#0033A0' }
];

export default function BankLogo({ bank, size = 24 }: { bank: string, size?: number }) {
  // Renders a clean white typographic/geometric logo for each bank
  const getLogo = () => {
    switch (bank) {
      case 'gcash':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C66.6 80 80 66.6 80 50H65C65 58.3 58.3 65 50 65C41.7 65 35 58.3 35 50C35 41.7 41.7 35 50 35C53.7 35 57.1 36.4 59.7 38.6L70.4 27.9C65.1 22.9 57.9 20 50 20Z" fill="white"/>
            <rect x="50" y="42.5" width="30" height="15" rx="4" fill="white"/>
          </svg>
        );
      case 'maya':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 75V25L50 50L75 25V75" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bpi':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="25" width="50" height="50" rx="8" stroke="white" strokeWidth="10"/>
            <circle cx="50" cy="50" r="10" fill="white"/>
          </svg>
        );
      case 'bdo':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20H45C58.8 20 70 31.2 70 45C70 58.8 58.8 70 45 70H20V20Z" stroke="white" strokeWidth="12"/>
            <rect x="40" y="40" width="10" height="10" fill="white"/>
          </svg>
        );
      case 'unionbank':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 20V55C20 71.6 33.4 85 50 85C66.6 85 80 71.6 80 55V20" stroke="white" strokeWidth="12" strokeLinecap="round"/>
          </svg>
        );
      case 'seabank':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 60C20 60 30 75 50 75C70 75 80 60 80 60" stroke="white" strokeWidth="10" strokeLinecap="round"/>
            <path d="M20 40C20 40 30 25 50 25C70 25 80 40 80 40" stroke="white" strokeWidth="10" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="8" fill="white"/>
          </svg>
        );
      case 'gotyme':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="50" r="15" stroke="white" strokeWidth="8"/>
            <circle cx="65" cy="50" r="15" fill="white"/>
          </svg>
        );
      case 'aub':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 20L20 75H35L42.5 60H57.5L65 75H80L50 20Z" stroke="white" strokeWidth="10" strokeLinejoin="round"/>
            <path d="M47 50H53" stroke="white" strokeWidth="8" strokeLinecap="round"/>
          </svg>
        );
      case 'rcbc':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="25" width="20" height="50" fill="white"/>
            <path d="M55 25H75C80 25 85 30 85 35C85 40 80 45 75 45H55V25Z" fill="white"/>
            <path d="M55 55H75C80 55 85 60 85 65C85 70 80 75 75 75H55V55Z" fill="white"/>
          </svg>
        );
      case 'metrobank':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 75L50 25L80 75H65L50 50L35 75H20Z" fill="white"/>
          </svg>
        );
      default:
        // Generic Bank Icon
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="10" width="18" height="10" rx="2" ry="2"/>
            <path d="M3 6l9-4 9 4"/>
            <path d="M3 10h18"/>
            <line x1="8" y1="14" x2="8" y2="16"/>
            <line x1="12" y1="14" x2="12" y2="16"/>
            <line x1="16" y1="14" x2="16" y2="16"/>
          </svg>
        );
    }
  };

  return <div className="flex items-center justify-center w-full h-full text-white">{getLogo()}</div>;
}
