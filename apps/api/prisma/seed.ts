import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = [
    { categoryId: "HOME_REPAIR", nameKo: "집수리", description: "가정 내 수리/설치/보수", tier: 1 },
    { categoryId: "WINDOW_REPAIR", nameKo: "창문수리", description: "창호/문/레일/락 수리", tier: 1 },
    { categoryId: "CAR_BATTERY", nameKo: "자동차 배터리 교체", description: "출장 배터리 점검/교체", tier: 1 },
    { categoryId: "MINI_EQUIP", nameKo: "미니중장비", description: "소형 장비 대여/작업", tier: 2 },
    { categoryId: "HEAVY_EQUIP", nameKo: "중장비", description: "굴삭/지게차 등 장비/인력", tier: 3 },
    { categoryId: "DRONE", nameKo: "드론촬영", description: "항공촬영/점검/측량", tier: 2 },
    { categoryId: "APP_DEV", nameKo: "앱개발", description: "앱/서비스 개발", tier: 2 },
    { categoryId: "PROG_DEV", nameKo: "프로그램개발", description: "자동화/웹/프로그램 개발", tier: 2 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { categoryId: c.categoryId },
      update: c,
      create: c,
    });
  }

  const cat = await prisma.category.findMany();
  const id = (categoryId: string) => cat.find(c => c.categoryId === categoryId)!.id;

  // Jobs (minimal)
  const jobs = [
    { categoryId: "HOME_REPAIR", jobId: "BASIC_FIX", name: "기본 수리/설치", baseDurationMin: 90, priceType: "QUOTE" },
    { categoryId: "WINDOW_REPAIR", jobId: "WINDOW_FIX", name: "창문/문 수리", baseDurationMin: 120, priceType: "QUOTE" },
    { categoryId: "CAR_BATTERY", jobId: "BATTERY_SWAP", name: "배터리 교체", baseDurationMin: 45, priceType: "FIXED" },
    { categoryId: "MINI_EQUIP", jobId: "MINI_EXCAV", name: "미니 장비 작업", baseDurationMin: 240, priceType: "HOURLY" },
    { categoryId: "HEAVY_EQUIP", jobId: "EXCAVATOR", name: "중장비 작업(승인필요)", baseDurationMin: 480, priceType: "QUOTE" },
    { categoryId: "DRONE", jobId: "DRONE_SHOOT", name: "드론 촬영", baseDurationMin: 120, priceType: "PACKAGE" },
    { categoryId: "APP_DEV", jobId: "APP_MVP", name: "앱 MVP 개발", baseDurationMin: 0, priceType: "MILESTONE" },
    { categoryId: "PROG_DEV", jobId: "AUTOMATION", name: "업무 자동화/개발", baseDurationMin: 0, priceType: "MILESTONE" },
  ];

  for (const j of jobs) {
    const job = await prisma.job.upsert({
      where: { categoryId_jobId: { categoryId: id(j.categoryId), jobId: j.jobId } },
      update: { name: j.name, baseDurationMin: j.baseDurationMin, isActive: true },
      create: { categoryId: id(j.categoryId), jobId: j.jobId, name: j.name, baseDurationMin: j.baseDurationMin },
    });

    await prisma.priceModel.upsert({
      where: { jobId: job.id },
      update: { type: j.priceType },
      create: { jobId: job.id, type: j.priceType, minPriceKrw: 0, maxPriceKrw: 0 },
    });

    await prisma.cancellationPolicy.upsert({
      where: { jobId: job.id },
      update: { policyId: "STD", freeCancelBeforeMin: 60, lateCancelFeeRate: 0.2, afterStartFeeRate: 1.0 },
      create: { jobId: job.id, policyId: "STD", freeCancelBeforeMin: 60, lateCancelFeeRate: 0.2, afterStartFeeRate: 1.0 },
    });

    await prisma.disputeProtocol.upsert({
      where: { jobId: job.id },
      update: { protocolId: "STD", timeLimitHours: 72, evidenceRequired: true, customerAckRequired: true },
      create: { jobId: job.id, protocolId: "STD", timeLimitHours: 72, evidenceRequired: true, customerAckRequired: true },
    });
  }

  // Input fields per category (minimal set)
  const common = [
    { fieldKey: "scheduled_at", label: "희망 일정", type: "DATETIME", required: true, options: [] },
    { fieldKey: "address", label: "주소", type: "TEXT", required: true, options: [] },
    { fieldKey: "details", label: "요청 상세", type: "TEXTAREA", required: true, options: [] },
    { fieldKey: "photos", label: "사진(선택)", type: "PHOTO_LIST", required: false, options: [] },
  ];

  for (const c of categories) {
    for (const f of common) {
      await prisma.inputField.upsert({
        where: { categoryId_fieldKey: { categoryId: id(c.categoryId), fieldKey: f.fieldKey } },
        update: { label: f.label, type: f.type, required: f.required, options: f.options },
        create: { categoryId: id(c.categoryId), fieldKey: f.fieldKey, label: f.label, type: f.type, required: f.required, options: f.options },
      });
    }
  }

  // Create demo admin/provider accounts (no password set — for local testing you can signup via API)
  await prisma.user.upsert({
    where: { email: "admin@fieldhub.local" },
    update: { role: "ADMIN" },
    create: { email: "admin@fieldhub.local", role: "ADMIN", name: "Admin" },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
