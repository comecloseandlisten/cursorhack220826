import type { MessageChannel, MessageMedia, MessageView } from "../types/messages";

const CANVAS_ID = "canvas_family";
const TZ = "+07:00";

const photos = {
  coffee:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=85",
  cooking:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=85",
  dinner:
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=85",
  flowers:
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=85",
  garden:
    "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=1400&q=85",
  pie:
    "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?auto=format&fit=crop&w=1400&q=85",
  tea:
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1400&q=85",
} as const;

export const senderNames: Record<string, string> = {
  alex: "Alex",
  dad: "Dad",
  grandma: "Grandma",
  kate: "Kate",
  mom: "Mom",
};

type MockMessage = {
  id: string;
  day: string;
  time: string;
  senderId: keyof typeof senderNames;
  text: string;
  channel?: MessageChannel;
  media?: MessageMedia[];
};

function message({
  id,
  day,
  time,
  senderId,
  text,
  channel = "dm",
  media = [],
}: MockMessage): MessageView {
  return {
    id,
    text: { body: text },
    revealAnimation: "fade",
    media,
    dateTimeSend: `${day}T${time}:00${TZ}`,
    canvasId: CANVAS_ID,
    dateTimeReveal: null,
    senderId,
    parentMessageId: null,
    tag: media.length ? "memory" : "note",
    channel,
  };
}

const image = (url: string): MessageMedia => ({ mime: "image/jpeg", url });
const video = (id: string): MessageMedia => ({
  mime: "video/mp4",
  url: `mock://video/${id}.mp4`,
});
const voice = (id: string): MessageMedia => ({
  mime: "audio/mpeg",
  url: `mock://voice/${id}.mp3`,
});

export const mockMessages: MessageView[] = [
  message({
    id: "d12-1",
    day: "2026-08-12",
    time: "07:42",
    senderId: "dad",
    text: "The first tomatoes from the garden",
    channel: "chat",
    media: [image(photos.garden)],
  }),
  message({
    id: "d12-2",
    day: "2026-08-12",
    time: "08:03",
    senderId: "mom",
    text: "Dad picked the first tomatoes this morning. He is very proud of them.",
  }),
  message({
    id: "d14-1",
    day: "2026-08-14",
    time: "16:18",
    senderId: "kate",
    text: "Flowers from the walk home",
    channel: "chat",
    media: [image(photos.flowers)],
  }),
  message({
    id: "d14-2",
    day: "2026-08-14",
    time: "16:22",
    senderId: "kate",
    text: "I found these on the way home and thought Grandma would love them.",
    media: [voice("d14-2")],
  }),
  message({
    id: "d15-1",
    day: "2026-08-15",
    time: "11:20",
    senderId: "kate",
    text: "Saturday lunch at Grandma’s",
    channel: "chat",
    media: [image(photos.dinner)],
  }),
  message({
    id: "d15-2",
    day: "2026-08-15",
    time: "12:05",
    senderId: "grandma",
    text: "Apple pie before everyone arrived",
    channel: "chat",
    media: [image(photos.pie)],
  }),
  message({
    id: "d15-3",
    day: "2026-08-15",
    time: "18:04",
    senderId: "grandma",
    text: "Alex, there is another slice of pie waiting for you tomorrow.",
    media: [voice("d15-3")],
  }),
  message({
    id: "d18-1",
    day: "2026-08-18",
    time: "08:12",
    senderId: "mom",
    text: "Dad has an appointment on Thursday. Let me know who can drive him.",
  }),
  message({
    id: "d18-2",
    day: "2026-08-18",
    time: "09:30",
    senderId: "dad",
    text: "No need to worry. I feel fine, and the appointment should be quick.",
    media: [voice("d18-2")],
  }),
  message({
    id: "d20-1",
    day: "2026-08-20",
    time: "16:40",
    senderId: "dad",
    text: "The kitchen halfway through dinner",
    channel: "chat",
    media: [image(photos.cooking)],
  }),
  message({
    id: "d20-2",
    day: "2026-08-20",
    time: "19:05",
    senderId: "mom",
    text: "Coffee after dinner",
    channel: "chat",
    media: [image(photos.coffee)],
  }),
  message({
    id: "d20-3",
    day: "2026-08-20",
    time: "21:18",
    senderId: "alex",
    text: "I made it home. Let us call tomorrow evening.",
    media: [voice("d20-3")],
  }),
  message({
    id: "d21-1",
    day: "2026-08-21",
    time: "15:30",
    senderId: "mom",
    text: "A quick hello from the park",
    media: [video("d21-1")],
  }),
  message({
    id: "d21-2",
    day: "2026-08-21",
    time: "17:08",
    senderId: "kate",
    text: "Tea on the balcony",
    channel: "chat",
    media: [image(photos.tea)],
  }),
  message({
    id: "d21-3",
    day: "2026-08-21",
    time: "22:11",
    senderId: "dad",
    text: "Thank you for coming. Breakfast is in the fridge.",
  }),
  message({
    id: "d22-1",
    day: "2026-08-22",
    time: "09:14",
    senderId: "alex",
    text: "Slow Saturday morning",
    media: [image(photos.coffee)],
  }),
  message({
    id: "d22-2",
    day: "2026-08-22",
    time: "16:20",
    senderId: "grandma",
    text: "The pie is ready",
    channel: "chat",
    media: [image(photos.pie)],
  }),
  message({
    id: "d22-3",
    day: "2026-08-22",
    time: "17:10",
    senderId: "kate",
    text: "Grandma showing the recipe",
    media: [video("d22-3")],
  }),
  message({
    id: "d22-4",
    day: "2026-08-22",
    time: "18:40",
    senderId: "dad",
    text: "Flowers for the table",
    channel: "chat",
    media: [image(photos.flowers)],
  }),
  message({
    id: "d22-5",
    day: "2026-08-22",
    time: "12:46",
    senderId: "mom",
    text: "Have you eaten? There is soup on the stove.",
    channel: "chat",
    media: [voice("d22-5")],
  }),
  message({
    id: "d22-6",
    day: "2026-08-22",
    time: "13:02",
    senderId: "kate",
    text: "I will send a photo tonight. It is just a new hair color.",
  }),
  message({
    id: "d22-7",
    day: "2026-08-22",
    time: "14:18",
    senderId: "grandma",
    text: "The pie is ready. Come by while it is still warm.",
    media: [voice("d22-7")],
  }),
  message({
    id: "d22-8",
    day: "2026-08-22",
    time: "15:04",
    senderId: "dad",
    text: "I will be home after six. I can pick everyone up.",
    channel: "chat",
    media: [voice("d22-8")],
  }),
  message({
    id: "d22-9",
    day: "2026-08-22",
    time: "16:08",
    senderId: "alex",
    text: "I bought tea. See you at Grandma’s tonight.",
  }),
];
