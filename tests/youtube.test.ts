import { describe, expect, it } from "vitest";
import { cleanYoutubeUrl, timeToSeconds, youtubeEvidenceLink, youtubeVideoId } from "@/lib/youtube";

describe("links de evidência do YouTube", () => {
  it("entende live, watch, youtu.be e shorts, sem rastreio", () => {
    expect(youtubeVideoId("https://www.youtube.com/live/qL2svAaFvd0?is=JOpXi31LC3-_IUSs")).toBe("qL2svAaFvd0");
    expect(youtubeVideoId("https://youtu.be/qL2svAaFvd0?si=abc")).toBe("qL2svAaFvd0");
    expect(youtubeVideoId("https://m.youtube.com/watch?v=qL2svAaFvd0&t=10")).toBe("qL2svAaFvd0");
    expect(youtubeVideoId("https://www.youtube.com/shorts/qL2svAaFvd0")).toBe("qL2svAaFvd0");
    expect(cleanYoutubeUrl("https://www.youtube.com/live/qL2svAaFvd0?is=x")).toBe("https://www.youtube.com/watch?v=qL2svAaFvd0");
  });

  it("recusa links que não são do YouTube", () => {
    expect(youtubeVideoId("https://evil.com/watch?v=qL2svAaFvd0")).toBeNull();
    expect(youtubeVideoId("javascript:alert(1)")).toBeNull();
    expect(youtubeVideoId("não é link")).toBeNull();
    expect(cleanYoutubeUrl("https://www.youtube.com/@canaldobenjaoficial")).toBeNull();
  });

  it("abre o vídeo no tempo da evidência", () => {
    expect(timeToSeconds("1:05:52")).toBe(3952);
    expect(timeToSeconds("08:12")).toBe(492);
    expect(youtubeEvidenceLink("https://www.youtube.com/watch?v=qL2svAaFvd0", "1:05:52")).toBe(
      "https://www.youtube.com/watch?v=qL2svAaFvd0&t=3952s",
    );
    expect(youtubeEvidenceLink("https://www.youtube.com/watch?v=qL2svAaFvd0")).toBe("https://www.youtube.com/watch?v=qL2svAaFvd0");
  });
});
