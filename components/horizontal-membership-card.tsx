'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  Facebook, 
  Linkedin, 
  Droplet, 
  ShieldCheck, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  QrCode,
  Sparkles
} from 'lucide-react';
import { MembershipRecord } from '@/lib/db';

interface HorizontalMembershipCardProps {
  member: MembershipRecord;
}

export function HorizontalMembershipCard({ member }: HorizontalMembershipCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState(false);

  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/verification/membership?id=${encodeURIComponent(member.membershipId)}`
    : `https://cec-hstu.org/verification/membership?id=${encodeURIComponent(member.membershipId)}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verificationUrl)}&bgcolor=ffffff&color=0f172a&margin=2`;

  const copyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(member.membershipId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const copyVerificationLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayBatch = member.batch 
    ? (String(member.batch).toLowerCase().includes('batch') ? member.batch : `Batch ${member.batch}`)
    : 'Active Batch';

  const numericBatchOnly = member.batch ? String(member.batch).replace(/\D/g, '') : '';

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* CARD WRAPPER */}
      <div className="w-full max-w-3xl print-card-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/20 dark:border-amber-400/30 bg-gradient-to-br from-[#0c1322] via-[#080d19] to-[#03060c] text-white shadow-2xl p-5 sm:p-7 md:p-8"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Subtle metallic background glow accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Subtle Grid Watermark Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
          />

          {/* Hologram Ribbon Corner */}
          <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none">
            <div className="absolute top-4 right-[-38px] w-40 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest text-center py-1 rotate-45 shadow-md border-y border-amber-300">
              OFFICIAL
            </div>
          </div>

          {/* CARD HEADER */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-white/10 p-1.5 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Image
                  src="/logo.png"
                  alt="Debating Society of HSTU"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
                    Debating Society of HSTU
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    HSTU DS
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-tight">
                  Hajee Mohammad Danesh Science and Technology University
                </p>
              </div>
            </div>

            {/* Status Chip */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {member.status || 'Active Member'}
            </div>
          </div>

          {/* CARD BODY - HORIZONTAL DUAL COLUMN LAYOUT */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* LEFT COLUMN: Avatar Photo + QR Code */}
            <div className="md:col-span-4 flex flex-row md:flex-col items-center justify-center gap-4 md:border-r md:border-white/10 md:pr-6">
              {/* Member Photo */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl bg-slate-900 shrink-0 group">
                <Image
                  src={member.photoUrl}
                  alt={member.fullName || member.name}
                  fill
                  sizes="(max-width: 640px) 112px, 128px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/95 text-slate-900 shadow-md">
                <div className="relative w-16 h-16 sm:w-18 sm:h-18">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="Verification QR Code"
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter text-slate-700 mt-1 flex items-center gap-0.5">
                  <QrCode className="w-2.5 h-2.5 text-blue-600" /> Scan to Verify
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Member Details & Metadata */}
            <div className="md:col-span-8 flex flex-col gap-3">
              
              {/* Top Identity Row */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {displayBatch} {numericBatchOnly ? `(#${numericBatchOnly})` : ''}
                  </span>

                  {member.bloodGroup && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      <Droplet className="w-3 h-3 text-rose-400" /> {member.bloodGroup}
                    </span>
                  )}

                  <span className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {member.status || 'Active'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {member.fullName || member.name}
                </h2>
                
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-300 font-medium mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{member.department || 'Debating Society of HSTU'}</span>
                </div>
              </div>

              {/* Data Grid: ID, Email, Phone, Joined */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/10 text-xs text-slate-300">
                {/* Membership ID */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Membership ID</p>
                    <p className="font-mono font-bold text-amber-300 text-sm">{member.membershipId}</p>
                  </div>
                  <button
                    onClick={copyId}
                    title="Copy Membership ID"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Issue / Joined Date */}
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Issue / Joined Date</p>
                  <p className="font-semibold text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                    {member.issueDate || 'Registered Member'}
                  </p>
                </div>

                {/* Email Address */}
                {member.email && (
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 col-span-1 sm:col-span-2 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                      <a 
                        href={`mailto:${member.email}`}
                        className="font-medium text-blue-300 hover:underline truncate block"
                      >
                        {member.email}
                      </a>
                    </div>
                    <a
                      href={`mailto:${member.email}`}
                      className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Social and Contact Links */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {member.facebookUrl && (
                    <a
                      href={member.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all hover:scale-105"
                    >
                      <Facebook className="w-3.5 h-3.5" /> Facebook
                    </a>
                  )}

                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all hover:scale-105"
                    >
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}

                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
                    >
                      <Phone className="w-3.5 h-3.5" /> {member.phone}
                    </a>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 font-mono tracking-wider">
                  AUTH_SEC_ID_{member.id.substring(0, 6).toUpperCase()}
                </div>
              </div>

            </div>
          </div>

          {/* CARD FOOTER BAR */}
          <div className="relative z-10 mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Official Verified Digital Membership Identity
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              HSTU RS • All Rights Reserved
            </span>
          </div>
        </motion.div>
      </div>

      {/* ACTION CONTROLS */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-3xl no-print">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl font-bold text-sm bg-info-light text-white shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print ID Card
        </button>

        <button
          onClick={copyVerificationLink}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm glass hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center gap-2 text-primary-light dark:text-primary"
        >
          {shareSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              Verification Link Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-info-light" />
              Copy Verification Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
