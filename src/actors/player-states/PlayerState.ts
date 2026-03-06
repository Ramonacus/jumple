import Phaser from 'phaser';

/**
 * Interface for all player movement states.
 * Each state handles its own behavior and transitions.
 */
export interface PlayerState {
  /**
   * Called once when entering this state.
   * Use for initialization: animations, timers, flags.
   */
  enter(player: any): void;

  /**
   * Called every frame while in this state.
   * Handle input, physics, and state transitions.
   */
  update(player: any, cursors: Phaser.Types.Input.Keyboard.CursorKeys): void;

  /**
   * Called once when exiting this state.
   * Use for cleanup: clear timers, finalize values.
   */
  exit(player: any): void;
}
