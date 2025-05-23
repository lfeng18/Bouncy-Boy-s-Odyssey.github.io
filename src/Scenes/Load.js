class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.image("tilemap_backgrounds", "tilemap-backgrounds_packed.png"); // 背景图块集
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        
        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // 加载音效
        this.load.audio('powerup', 'assets/audio/powerup.ogg');

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });


        // 硬币动画
        this.anims.create({
            key: 'coinSpin',
            frames: [
                {key: 'tilemap_sheet', frame: 151},
                {key: 'tilemap_sheet', frame: 152}
                ],
            frameRate: 5,
            repeat: -1
        });

        //敌人行走动画
        this.anims.create({
                key: 'enemy_walk',
                defaultTextureKey: "platformer_characters",
                frames: [
                    { frame: "tile_0002.png" }, // 第一帧
                    { frame: "tile_0003.png" }  // 第二帧
                ],
                frameRate: 5,
                repeat: -1
            });

        //大金币动画
        this.anims.create({
            key: 'bigCoinSpin',
            frames: [
                {key: 'tilemap_sheet', frame: 151},
                {key: 'tilemap_sheet', frame: 152},
                {key: 'tilemap_sheet', frame: 151},
                {key: 'tilemap_sheet', frame: 152},
                {key: 'tilemap_sheet', frame: 151},
                {key: 'tilemap_sheet', frame: 152}
            ],
            frameRate: 3, // 较慢的旋转速度
            repeat: -1
        });


         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}