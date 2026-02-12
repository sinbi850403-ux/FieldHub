export type Category = { id: string; categoryId: string; nameKo: string; description?: string; tier: number };
export type Job = { id: string; jobId: string; name: string; baseDurationMin: number; priceModel: { type: string } };
export type InputField = { fieldKey: string; label: string; type: string; required: boolean; options?: string[] };

export type CreateBookingPayload = {
  categoryId: string;
  jobId: string;
  scheduledAt: string;
  addressText?: string;
  lat?: number;
  lng?: number;
  priceQuoteTotal?: number;
  inputs: Array<{ fieldKey: string; valueText?: string; valueJson?: any }>;
};
