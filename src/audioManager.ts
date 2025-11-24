type TrackKey = "menu" | "exploration" | "minigame2" | "combat" | "pokemon" | "result";
type SfxKey =
  | "game_over"
  | "minigame_lose"
  | "movement"
  | "object_collect"
  | "page_flip"
  | "robot_completion"
  | "robot_damage"
  | "robot_punch";

type PlayOptions = {
  playbackRate?: number;
  delayMs?: number;
  volume?: number;
};

class AudioManager {
  private tracks: Record<TrackKey, HTMLAudioElement>;
  private sfx: Record<SfxKey, HTMLAudioElement>;
  private currentTrack?: HTMLAudioElement;
  private readonly trackVolume = 0.12;
  private readonly sfxVolume = 0.5;

  constructor() {
    const makeTrack = (src: string) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = this.trackVolume;
      return audio;
    };

    const makeSfx = (src: string) => {
      const audio = new Audio(src);
      audio.volume = this.sfxVolume;
      return audio;
    };

    this.tracks = {
      menu: makeTrack("/sounds/soundtrack/mainMenuMusic.mp3"),
      exploration: makeTrack("/sounds/soundtrack/mainExploration.mp3"),
      minigame2: makeTrack("/sounds/soundtrack/minigame2.mp3"),
      combat: makeTrack("/sounds/soundtrack/zombieScene.mp3"),
      pokemon: makeTrack("/sounds/soundtrack/pokemonBattleMusic.mp3"),
      result: makeTrack("/sounds/soundtrack/mainMenuMusic.mp3"),
    };

    this.sfx = {
      game_over: makeSfx("/sounds/sfx/game_over.mp3"),
      minigame_lose: makeSfx("/sounds/sfx/minigame_lose.mp3"),
      movement: makeSfx("/sounds/sfx/movement_cut.mp3"),
      object_collect: makeSfx("/sounds/sfx/object_collect.mp3"),
      page_flip: makeSfx("/sounds/sfx/page_flip.mp3"),
      robot_completion: makeSfx("/sounds/sfx/robot_completion.mp3"),
      robot_damage: makeSfx("/sounds/sfx/robot_damage.mp3"),
      robot_punch: makeSfx("/sounds/sfx/robot_punch.mp3"),
    };
  }

  playTrack(key: TrackKey): void {
    const next = this.tracks[key];
    if (!next) return;
    if (this.currentTrack && this.currentTrack !== next) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
    }
    this.currentTrack = next;
    void this.currentTrack.play().catch(() => {
      /* autoplay may be blocked until user gesture */
    });
  }

  playSfx(key: SfxKey, options: PlayOptions = {}): void {
    const base = this.sfx[key];
    if (!base) return;
    const clone = base.cloneNode(true) as HTMLAudioElement;
    clone.volume = options.volume ?? this.sfxVolume;
    if (options.playbackRate) clone.playbackRate = options.playbackRate;
    const play = () => void clone.play().catch(() => {});
    if (options.delayMs && options.delayMs > 0) {
      setTimeout(play, options.delayMs);
    } else {
      play();
    }
  }
}

export const audioManager = new AudioManager();
