// madleague.net(아임웹)에서 이전한 프로그램 이미지 — Storage board-assets/madleague/programs/{group}/{id}.webp
// 업로드: Scripts/madleague-programs-import.mjs (같은 group·id 목록)
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/board-assets/madleague/programs`;

export const madProgramAsset = (group: string, id: string) => `${BASE}/${group}/${id}.webp`;

export const MAD_PROGRAM_IMAGES = {
    creazyHero: madProgramAsset("creazy", "6f08fd889c1c5"),
    damHero: madProgramAsset("dam", "e55bba5dd5ebb"),
    damPoster: madProgramAsset("dam", "4ce3bfc9ae848"),
    /** DAM 파티 시즌 3 현장·안내 (원본 순서) */
    damGallery: ["2142ccb80a031", "b83a9480f4e95", "d9f2d062661a8", "2a2c77eb17f0f", "c6ee55c38851b", "76798f6f09093", "ec8dedb1cb5e4", "eebca32ac898a", "e9dbf1e7262c1"]
        .map(id => madProgramAsset("dam", id)),
    /** DAM 히스토리 — 시즌 2 스케치 (원본 순서) */
    damHistory: ["73ba05a743a0a", "f1aff9a115f41", "3eb7596632e82", "053b30d9771a6", "60a278461a184", "7d88bc18b46ff", "63ba888f1c0d0", "aaf79dbf3401e", "594f8f2de62e1", "c60be401d9697", "956b0f23d844d"]
        .map(id => madProgramAsset("dam-history", id)),
    imHero: madProgramAsset("im", "92372a42e8330"),
    imBanner: madProgramAsset("im", "199b0a48b3817"),
    heroWide: madProgramAsset("hero", "bf978f83e29d6"),
    heroTall: madProgramAsset("hero", "a1ed9bf576277"),
    ptHero: madProgramAsset("pt", "88dd025d720da"),
};
