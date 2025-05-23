class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;

        this.score = 0;

        this.playerScale = 1.0;
    }

    preload() {


       


        // Load the animated tiles plugin
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');

        //加载音效
        this.load.audio('powerup', 'assets/audio/powerup.ogg');
        this.load.audio('mushroom', 'assets/audio/mushroom.ogg');
        this.load.audio('splash', 'assets/audio/splash.ogg');
        this.load.audio('enemyHit', 'assets/audio/enemyHit.ogg');
        this.load.audio('bigCoin', 'assets/audio/bigCoin.ogg');
        this.load.audio('coin', 'assets/audio/coin.ogg');
        this.load.audio('victory', 'assets/audio/victory.ogg');
        this.load.audio('run', 'assets/audio/run.ogg');
        this.load.audio('jump', 'assets/audio/jump.ogg');
        this.load.audio('gameStart', 'assets/audio/gameStart.ogg');
    }


    create() {
        // 初始化音效
    this.gameStartSound = this.sound.add('gameStart', { volume: 0.5 });
    
    // 播放游戏开始音效
    this.gameStartSound.play();
        
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 120, 25);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.backgroundTileset = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap-backgrounds");

        // Create a layer
       

        this.backgroundLayer = this.map.createLayer("Background", this.backgroundTileset, 0, 0);
        

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
    
        this.decorationLayer = this.map.createLayer("Decoration", this.tileset, 0, 0);

        // 初始化音效
        



        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // Create coins from Objects layer in tilemap
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        

        // Find water tiles
        this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.water == true;
        });

        ////////////////////
        // TODO: put water bubble particle effect here
        // It's OK to have it start running
        ////////////////////
       const bubbles = this.add.particles('kenny-particles');
        
        // 2. 为每个水瓦片创建发射器
        this.waterTiles.forEach(tile => {
            const x = tile.getCenterX();
            const y = tile.getCenterY();
        
        // 3. 直接创建发射器而不需要先创建管理器
        const emitter = this.add.particles(x, y, 'kenny-particles', {
            frame: ['star_05.png', 'star_05.png'],
            scale: { start: 0.05, end: 0.15 },
            lifespan: 1500,
            speed: { min: 5, max: 15 },
            gravityY: -50,
            alpha: { start: 0.4, end: 0 },
            frequency: 500,
            blendMode: 'ADD',
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(0, 0, tile.width, tile.height),
                quantity: 1
            }
        });
            
            // 创建发射器
            
        });



        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // TODO: create coin collect particle effect here
        // Important: make sure it's not running
        
  
        // Coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            ////////////////////
            // TODO: start the coin collect particle effect here
            ////////////////////
            this.score += 10; // 增加10分
            this.scoreText.setText('Score: ' + this.score); // 更新分数显示
            this.sound.play('coin');

           my.vfx.coinCollect.emitParticleAt(obj2.x, obj2.y);

        });

        
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true, // 添加随机帧选择
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 8, // 限制最大粒子数
            lifespan: 350,
            gravityY: -400, // 让粒子向上飘
            alpha: {start: 1, end: 0.1},
            emitZone: { // 从玩家脚部发射
                type: 'random',
                source: new Phaser.Geom.Rectangle(-10, 5, 20, 5)
            }
        });

        my.vfx.walking.stop();


        // Simple camera to follow player
        // 添加浅蓝色背景（放在create()函数的最开始处）
        this.cameras.main.setBackgroundColor('#a6e3fc');


        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        
        

        // 3. 加载可碰撞的初始方块（exclamationBox1）
        this.boxGroup = this.add.group();
        const initialBoxes = this.map.createFromObjects("Objects", {
            name: "exclamationBox1",
            key: "tilemap_sheet",
            frame: 10
        });
        
        this.physics.world.enable(initialBoxes);  // 先启用物理
            initialBoxes.forEach(box => {
                box.body.setImmovable(true);         // 设为不可推动
                box.body.allowGravity = false;       // 关闭重力
                box.body.moves = false;              // 禁止物理引擎移动
                box.setOrigin(0, 0);                 // 对齐坐标
                this.boxGroup.add(box);
            });

        // 4. 初始化蘑菇组
        this.mushroomGroup = this.add.group();

        // 5. 方块碰撞检测
        this.physics.add.collider(
            my.sprite.player,
            this.boxGroup,
            (player, box) => {
                // 只处理 exclamationBox1
                if (box.name !== "exclamationBox1") return;

                // 精确底部碰撞检测
                if (player.body.velocity.y > 0 && 
                    player.body.bottom <= box.body.top + 2) {

                    // 记录方块位置
                    const boxX = box.x;
                    const boxY = box.y;
                    const boxWidth = box.width;

                    // 4. 将 exclamationBox1 替换为 exclamationBox2
                    box.setTexture("tilemap_sheet", 68); // 切换为红色感叹号
                    box.name = "exclamationBox2"; // 更新名称
                    box.body.enable = false; // 禁用物理（变成装饰性物体）

                    // 5. 在上方生成蘑菇
                    const mushroom = this.physics.add.sprite(
                        boxX + boxWidth / 2,
                        boxY - 18, // 瓦片高度18
                        "tilemap_sheet",
                        69
                    );
                    mushroom.setOrigin(0.5, 0);
                    mushroom.body.setAllowGravity(false);
                    this.mushroomGroup.add(mushroom);

                    // 6. 粒子效果（可选）
                    this.add.particles(boxX, boxY, 'kenny-particles', {
                        frame: ['smoke_03.png'],
                        scale: 0.3,
                        lifespan: 500,
                        quantity: 5
                    });
                }
            }
        );
        this.mushroomGroup = this.add.group();
        const mushrooms = this.map.createFromObjects("Objects", {
            name: "mushroom", // Tiled中蘑菇对象的name属性
            key: "tilemap_sheet",
            frame: 128 // 蘑菇的帧编号
        });

        // 启用蘑菇物理属性
        this.physics.world.enable(mushrooms);
        mushrooms.forEach(mushroom => {
            mushroom.setOrigin(0.5, 0); // 锚点底部居中
            mushroom.setScale(1.5);
            mushroom.body.setAllowGravity(false); // 蘑菇静止不动
            this.mushroomGroup.add(mushroom);
            
        });

        // 3. 玩家与蘑菇的碰撞检测
        this.physics.add.overlap(
            my.sprite.player,
            this.mushroomGroup,
            (player, mushroom) => {
                mushroom.destroy(); // 移除蘑菇
                this.sound.play('mushroom');
                // 玩家变大效果
                player.setScale(1.5);
                
                // 5秒后恢复原大小
                this.time.delayedCall(5000, () => {
                    player.setScale(1.0);
                });

                // 粒子效果（可选）
                const particles = this.add.particles(mushroom.x, mushroom.y, 'kenny-particles', {
                    frame: ['smoke_03.png'],
                    scale: 0.3,
                    lifespan: 500,  // 单个粒子存活时间（毫秒）
                    frequency: 50,   // 降低生成频率
                    quantity: 3      // 减少单次生成数量
                    });

    // 2. 0.5秒后销毁整个粒子系统
            this.time.delayedCall(500, () => {
                particles.destroy(); // 完全移除粒子效果
                });
            }
        );


    //EC2: 硬币收集效果和计分系统
        my.vfx.coinCollect = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_04.png', 'star_05.png'],
            scale: {start: 0.1, end: 0.3},
            lifespan: 500,
            speed: 100,
            gravityY: 200,
            alpha: {start: 1, end: 0},
            quantity: 5,
            blendMode: 'ADD'
        });
        my.vfx.coinCollect.stop();

     
        
        // 为所有硬币应用动画
        this.coinGroup.getChildren().forEach(coin => {
        coin.anims.play('coinSpin');
        });

        // EC1(a): 查找出生点
        const spawnPoints = this.map.filterObjects("Objects", obj => obj.name === "spawnPoint");
        const spawnPoint = spawnPoints.length > 0 ? spawnPoints[0] : {x: 30, y: 345};

        // 创建玩家角色（这是唯一创建玩家的地方）
        
        my.vfx.waterSplash = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_09.png', 'smoke_10.png'],
            scale: {start: 0.2, end: 0.5},
            lifespan: 10,
            speed: 100,
            gravityY: -100,
            alpha: {start: 1, end: 0},
            quantity: 10,
            blendMode: 'ADD'
        });
        my.vfx.waterSplash.stop();


        // EC1(b): 添加二段跳道具
        // 在类顶部添加成员变量（constructor或init中）
        this.canDoubleJump = false;  // 是否允许二段跳
        this.hasDoubleJumpPowerup = false;  // 是否获得了二段跳能力
        this.jumpCount = 0;  // 当前跳跃次数

        // 创建道具组
        this.powerups = this.map.createFromObjects("Objects", {
            name: "powerup",
            key: "tilemap_sheet",
            frame: 67  // 使用星星或其他明显道具帧
        }).map(powerup => {
            powerup.setScale(1.5); // 放大 1.5 倍
            return powerup;
        });

        this.physics.world.enable(this.powerups, Phaser.Physics.Arcade.STATIC_BODY);
        this.powerupGroup = this.add.group(this.powerups);

        this.powerups.forEach(powerup => {
            this.tweens.add({
                targets: powerup,
                angle: 360, // 旋转 360 度
                duration: 2000,
                repeat: -1  // 无限循环
            });
        });

        // 添加碰撞检测
        this.physics.add.overlap(my.sprite.player, this.powerupGroup, (player, powerup) => {
            

            powerup.destroy();
            this.hasDoubleJumpPowerup = true;  // 永久获得二段跳能力
            this.sound.play('powerup'); // 播放道具声
            // 可以添加粒子效果提示
            const particles = this.add.particles(powerup.x, powerup.y, 'kenny-particles', {
                frame: 'star_04.png',
                scale: { start: 0.2, end: 0 },
                lifespan: 800,
                speed: 20,
                quantity: 3,
                rotate: { start: 0, end: 360 },
                blendMode: 'ADD',
                alpha: { start: 0.8, end: 0 }
            });
    
            // 500毫秒后自动销毁粒子系统
            this.time.delayedCall(500, () => {
                particles.destroy();
            });
        });

        my.vfx.doubleJump = this.add.particles(0, 0, 'kenny-particles', {
            frame: ['muzzle_01.png', 'muzzle_02.png'], // 多帧增强随机性
            flipY: true, 
            scale: { start: 0.2, end: 0 },
            lifespan: 400,
            speed: { min: 20, max: 100 },
            angle: { min: 0, max: 360 }, // 360度全方位发射
            gravityY: 50,                // 轻微向下
            alpha: { start: 1, end: 0 },
            quantity: 3,                // 更多粒子
            blendMode: 'SCREEN',
            emitting: false
        });
        my.vfx.doubleJump.stop(); // 确保初始状态是停止的


        //生成敌人
        this.enemies = this.physics.add.group();
        const EspawnPoints = this.map.filterObjects("Objects", obj => obj.name === "EnemySpawns");
        
        // 随机选择几个生成点
        

        const selectedSpawns = Phaser.Utils.Array.Shuffle(EspawnPoints).slice(0, 3);
        
        selectedSpawns.forEach(point => {
            let enemy = this.enemies.create(point.x, point.y, "platformer_characters", "tile_0002.png");
            enemy.setScale(1);
            enemy.setCollideWorldBounds(false); // 不再需要世界边界碰撞
            enemy.setVelocityX(100); // 初始速度
            enemy.setBounce(0); // 不需要反弹
            enemy.direction = 1; // 1表示右，-1表示左
            enemy.patrolRange = 200; // 巡逻范围
            enemy.originX = point.x; // 记录初始位置

            // 添加这行代码播放动画
            

            console.log(`生成敌人 at (${point.x}, ${point.y})`);
            
        });

        // 碰撞检测
        this.physics.add.collider(this.enemies, this.groundLayer);
        this.physics.add.collider(
            my.sprite.player, 
            this.enemies, 
            (player, enemy) => {
                // 计算反弹方向
                let bounceDirection = (player.x < enemy.x) ? -1 : 1;
                
                // 设置玩家被弹开的速度
                player.body.setVelocityX(400 * bounceDirection); // 水平反弹
                player.body.setVelocityY(-300); // 向上弹跳
                
                // 可以在这里添加受伤效果或减少生命值
                player.tint = 0xff0000; // 短暂变红表示受伤
                this.sound.play('enemyHit');
                this.time.delayedCall(200, () => {
                    player.tint = 0xffffff; // 恢复颜色
                });
            },
            null,
            this
        );

        //生成大金币
        this.bigCoins = this.map.createFromObjects("Objects", {
            name: "bigCoin",
            key: "tilemap_sheet",
            frame: 151 // 使用与普通硬币相同的初始帧
        });

        // 启用物理并设置大小
        this.physics.world.enable(this.bigCoins, Phaser.Physics.Arcade.STATIC_BODY);
        this.bigCoinGroup = this.add.group(this.bigCoins);

        // 设置大金币的大小和动画
        this.bigCoinGroup.getChildren().forEach(bigCoin => {
            bigCoin.setScale(3); // 设置为5倍大小
            bigCoin.anims.play('bigCoinSpin');
        });

        // 添加大金币碰撞检测
        this.physics.add.overlap(my.sprite.player, this.bigCoinGroup, (obj1, obj2) => {
            obj2.destroy(); // 移除大金币
            this.score += 50; // 增加50分
            this.scoreText.setText('Score: ' + this.score); // 更新分数显示
            this.sound.play('bigCoin');
            
            // 更华丽的粒子效果
            const particles = this.add.particles(obj2.x, obj2.y, 'kenny-particles', {
                frame: ['star_04.png', 'star_05.png', 'star_06.png'],
                scale: { start: 0.3, end: 0.6 },
                lifespan: 1000,
                speed: { min: 50, max: 150 },
                angle: { min: 0, max: 360 },
                gravityY: 100,
                quantity: 10,
                blendMode: 'ADD'
            });
            
            // 2秒后自动销毁粒子系统
            this.time.delayedCall(2000, () => {
                particles.destroy();
            });
            
            // 可以在这里添加额外的分数或其他效果
        });


        //终点
        // 创建旗帜终点
        this.flag = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 111 // 使用适合的帧编号
        })[0]; // createFromObjects返回数组，我们取第一个

        if (this.flag) {
            this.physics.world.enable(this.flag);
            this.flag.body.setAllowGravity(false);
            this.flag.body.setImmovable(true);
            this.flag.touched = false; // 初始化触碰状态
            
            // 添加旗帜动画
            this.flag.anims.create({
                key: 'flagWave',
                frames: this.anims.generateFrameNumbers('tilemap_sheet', { 
                    start: 111, 
                    end: 112 // 假设152-155是旗帜动画帧
                }),
                frameRate: 8,
                repeat: -1
            });
            this.flag.anims.play('flagWave');
        }

        // 创建完成文本（初始隐藏）
        this.missionCompleteText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'MISSION COMPLETED!',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#FFFF00',
                backgroundColor: '#000000AA', // 添加半透明背景确保可见
                padding: { x: 20, y: 10 },
                stroke: '#000000',
                strokeThickness: 4,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 2,
                    stroke: true,
                    fill: true
                }
            }
        )
        .setOrigin(0.5)
        .setVisible(false)
        .setDepth(1000)  // 确保在最上层
        .setScrollFactor(0); // 关键：不随相机移动

        // 添加旗帜碰撞检测
        if (this.flag) {
            this.physics.add.overlap(
                my.sprite.player,
                this.flag,
                this.completeMission,
                null,
                this
            );
        }


        // 创建飞行敌人组
        this.flyingEnemies = this.physics.add.group();

        // 从地图对象层获取飞行敌人生成点
        const flyingSpawnPoints = this.map.filterObjects("Objects", obj => obj.name === "FlyingEnemySpawns");

        // 创建飞行敌人
        flyingSpawnPoints.forEach(point => {
            let flyingEnemy = this.flyingEnemies.create(point.x, point.y, "platformer_characters", "tile_0025.png"); // 使用适合的帧

            // 核心调整：缩小碰撞体
            flyingEnemy.body.setSize(10, 10); // 10x10像素的碰撞体
            flyingEnemy.body.setOffset(10, 10); // 向右下方偏移

            flyingEnemy.setScale(1);
            flyingEnemy.setCollideWorldBounds(false);
            flyingEnemy.setVelocityX(80); // 初始速度
            flyingEnemy.direction = 1; // 1表示右，-1表示左
            flyingEnemy.patrolRange = 100; // 巡逻范围
            flyingEnemy.originX = point.x; // 记录初始位置
            flyingEnemy.flying = true; // 标记为飞行敌人
            
            // 可以设置一个上下浮动的参数
            flyingEnemy.floatAmplitude = 10; // 上下浮动幅度
            flyingEnemy.floatSpeed = 0.01; // 浮动速度
            flyingEnemy.floatOffset = Math.random() * Math.PI * 3; // 随机相位偏移
            
            console.log(`生成飞行敌人 at (${point.x}, ${point.y})`);
        });
        
        //飞行敌人碰撞
        this.physics.add.overlap(
            my.sprite.player, 
            this.flyingEnemies, 
            (player, enemy) => {
                // 计算反弹方向
                let bounceDirection = (player.x < enemy.x) ? -1 : 1;
                
                // 设置玩家被弹开的速度
                player.body.setVelocityX(400 * bounceDirection); // 水平反弹
                player.body.setVelocityY(-300); // 向上弹跳
                
                // 受伤效果
                player.tint = 0xff0000; // 短暂变红表示受伤

                this.sound.play('enemyHit');

                this.time.delayedCall(200, () => {
                    player.tint = 0xffffff; // 恢复颜色
                });
            },
            null,
            this
        );


        // 创建分数文本
        this.scoreText = this.add.text(15, 15, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 2,
                stroke: true,
                fill: true
            }
        })
        
        console.log('scoreText created');

        


        this.runSound = this.sound.add('run', { 
            volume: 0.3,
            loop: true  // 循环播放跑步声
        });

        this.jumpSound = this.sound.add('jump', {
            volume: 0.5
        });
        
        this.controlsText = this.add.text(15, 400, '← → move | ↑ jump', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 2,
                stroke: true,
                fill: true
            }
        })
        
    

        // Initialize the animated tiles plugin
        // This line needs to come *after* any line which creates a tilemap layer.
        // Putting this at the end of create() is a safe place
        this.animatedTiles.init(this.map);

    }


    completeMission(player, flag) {
        // 防止重复触发
        if (flag.touched) return;
        flag.touched = true;
        
        console.log('首次触碰到旗帜');
        
        // 停止玩家移动
        player.body.setVelocity(0, 0);
        player.anims.stop();
        this.sound.play('victory');

        player.body.enable = false;
        
        // 确保文字在屏幕中央且可见
        this.missionCompleteText.setPosition(
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );
        this.missionCompleteText.setVisible(true);
        this.missionCompleteText.setScrollFactor(0); // 关键修复：使文字不随相机移动
        
        console.log('文字位置:', this.missionCompleteText.x, this.missionCompleteText.y);
        console.log('文字是否可见:', this.missionCompleteText.visible);
        
        // 禁用输入
        this.input.keyboard.enabled = false;

        this.runSound.stop();

        // 5秒后重置
        this.time.delayedCall(5000, () => {
            console.log('尝试重置游戏'); // 调试用
            this.resetGameState();
        }, [], this);
    }

    resetGameState() {
    console.log('正在重置游戏状态'); // 调试日志

    this.gameStartSound.play();

    // 1. 隐藏任务完成文本
    this.missionCompleteText.setVisible(false);

    // 2. 重置玩家状态 ----------------------------------------
    const spawnPoint = this.findSpawnPoint();
    my.sprite.player.x = spawnPoint.x;
    my.sprite.player.y = spawnPoint.y;
    my.sprite.player.body.enable = true;
    my.sprite.player.setVelocity(0, 0);
    my.sprite.player.setScale(1.0); // 重置大小
    my.sprite.player.tint = 0xffffff; // 清除受伤效果
    my.sprite.player.clearTint();
    this.hasDoubleJumpPowerup = false; // 重置二段跳能力
    this.jumpCount = 0;

    this.input.keyboard.enabled = true;

    // 3. 重置所有游戏对象 ------------------------------------
    
    // 3.1 硬币组
    if (this.coinGroup) {
        this.coinGroup.clear(true, true); // 清除现有硬币
    }
    this.coins = this.map.createFromObjects("Objects", {
        name: "coin",
        key: "tilemap_sheet",
        frame: 151
    });
    this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
    this.coinGroup = this.add.group(this.coins);
    this.coinGroup.getChildren().forEach(coin => {
        coin.anims.play('coinSpin'); // 重新播放动画
        
    });

    // 3.2 大金币组
    if (this.bigCoinGroup) {
        this.bigCoinGroup.clear(true, true);
    }
    this.bigCoins = this.map.createFromObjects("Objects", {
        name: "bigCoin",
        key: "tilemap_sheet",
        frame: 151
    });
    this.physics.world.enable(this.bigCoins, Phaser.Physics.Arcade.STATIC_BODY);
    this.bigCoinGroup = this.add.group(this.bigCoins);
    this.bigCoinGroup.getChildren().forEach(bigCoin => {
        bigCoin.setScale(3);
        bigCoin.anims.play('bigCoinSpin');
    });

    // 3.3 蘑菇组
    if (this.mushroomGroup) {
        this.mushroomGroup.clear(true, true);
    }
    const mushrooms = this.map.createFromObjects("Objects", {
        name: "mushroom",
        key: "tilemap_sheet",
        frame: 128
    });
    this.physics.world.enable(mushrooms);
    mushrooms.forEach(mushroom => {
        mushroom.setScale(1.5);
        mushroom.setOrigin(0.5, 0);
        mushroom.body.setAllowGravity(false);
        this.mushroomGroup.add(mushroom);
    });

    // 3.4 感叹号方块组
    if (this.boxGroup) {
        this.boxGroup.clear(true, true);
    }
    const initialBoxes = this.map.createFromObjects("Objects", {
        name: "exclamationBox1",
        key: "tilemap_sheet",
        frame: 10
    });
    this.physics.world.enable(initialBoxes);
    initialBoxes.forEach(box => {
        box.body.setImmovable(true);
        box.body.allowGravity = false;
        box.body.moves = false;
        box.setOrigin(0, 0);
        this.boxGroup.add(box);
    });

    // 3.5 敌人组
    if (this.enemies) {
        this.enemies.clear(true, true);
    }
    const EspawnPoints = this.map.filterObjects("Objects", obj => obj.name === "EnemySpawns");
    const selectedSpawns = Phaser.Utils.Array.Shuffle(EspawnPoints).slice(0, 3);
    selectedSpawns.forEach(point => {
        let enemy = this.enemies.create(point.x, point.y, "platformer_characters", "tile_0002.png");
        enemy.setScale(1);
        enemy.setCollideWorldBounds(false);
        enemy.setVelocityX(100);
        enemy.setBounce(0);
        enemy.direction = 1;
        enemy.patrolRange = 200;
        enemy.originX = point.x;
    });

    // 3.6 飞行敌人组
    if (this.flyingEnemies) {
        this.flyingEnemies.clear(true, true);
    }
    const flyingSpawnPoints = this.map.filterObjects("Objects", obj => obj.name === "FlyingEnemySpawns");
    flyingSpawnPoints.forEach(point => {
        let flyingEnemy = this.flyingEnemies.create(point.x, point.y, "platformer_characters", "tile_0025.png");
        flyingEnemy.body.setSize(10, 10);
        flyingEnemy.body.setOffset(10, 10);
        flyingEnemy.setScale(1);
        flyingEnemy.setCollideWorldBounds(false);
        flyingEnemy.setVelocityX(80);
        flyingEnemy.direction = 1;
        flyingEnemy.patrolRange = 100;
        flyingEnemy.originX = point.x;
        flyingEnemy.originY = point.y;
        flyingEnemy.floatAmplitude = 10;
        flyingEnemy.floatSpeed = 0.01;
        flyingEnemy.floatOffset = Math.random() * Math.PI * 3;
    });

    // 3.7 能力道具组
    if (this.powerupGroup) {
        this.powerupGroup.clear(true, true);
    }
    this.powerups = this.map.createFromObjects("Objects", {
        name: "powerup",
        key: "tilemap_sheet",
        frame: 67
    }).map(powerup => {
    powerup.setScale(1.5); // 放大 1.5 倍
    return powerup;
    }).map(powerup => {
    powerup.setScale(1.5); // 放大 1.5 倍
        // 重新添加旋转动画
        this.tweens.add({
            targets: powerup,
            angle: 360, // 旋转 360 度
            duration: 2000,
            repeat: -1  // 无限循环
        });
        return powerup;
    });
    this.physics.world.enable(this.powerups, Phaser.Physics.Arcade.STATIC_BODY);
    this.powerupGroup = this.add.group(this.powerups);

    // 4. 重置旗帜状态 ----------------------------------------
    if (this.flag) {
        this.flag.touched = false;
        this.flag.setTexture("tilemap_sheet", 111);
        this.flag.anims.play('flagWave');
        this.flag.body.enable = true;
    }

    // 5. 重置分数和UI ----------------------------------------
    this.score = 0;
    this.scoreText.setText('Score: 0');

    // 6. 重新启用输入 ----------------------------------------
    this.input.keyboard.enabled = true;
    this.cameras.main.startFollow(my.sprite.player); // 重新跟随玩家

    // 7. 重新绑定所有碰撞检测
    this.rebindCollisions();
    
    console.log('游戏状态已完全重置，碰撞检测已重新绑定');
}

// 辅助方法：查找出生点
findSpawnPoint() {
    const points = this.map.filterObjects("Objects", obj => obj.name === "spawnPoint");
    return points.length > 0 ? points[0] : {x: 30, y: 345};
}


// 新增方法：重新绑定所有碰撞检测
rebindCollisions() {
    // 硬币碰撞
    this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
        obj2.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.sound.play('coin'); 
        my.vfx.coinCollect.emitParticleAt(obj2.x, obj2.y);
    });

    // 大金币碰撞
    this.physics.add.overlap(my.sprite.player, this.bigCoinGroup, (obj1, obj2) => {
        obj2.destroy();
        this.sound.play('bigCoin');
        this.score += 50;
        this.scoreText.setText('Score: ' + this.score);
        const particles = this.add.particles(obj2.x, obj2.y, 'kenny-particles', {
            frame: ['star_04.png', 'star_05.png', 'star_06.png'],
            scale: { start: 0.3, end: 0.6 },
            lifespan: 1000,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            gravityY: 100,
            quantity: 10,
            blendMode: 'ADD'
        });
        this.time.delayedCall(2000, () => particles.destroy());
    });

    // 能力道具碰撞
    this.physics.add.overlap(my.sprite.player, this.powerupGroup, (player, powerup) => {
        powerup.destroy();
        this.hasDoubleJumpPowerup = true;
        this.sound.play('powerup');

        const particles = this.add.particles(powerup.x, powerup.y, 'kenny-particles', {
            frame: 'star_04.png',
            scale: { start: 0.2, end: 0 },
            lifespan: 800,
            speed: 20,
            quantity: 3,
            rotate: { start: 0, end: 360 },
            blendMode: 'ADD',
            alpha: { start: 0.8, end: 0 }
        });
        this.time.delayedCall(500, () => particles.destroy());
    });

    // 蘑菇碰撞
    this.physics.add.overlap(my.sprite.player, this.mushroomGroup, (player, mushroom) => {
        mushroom.destroy();
        player.setScale(1.5);
        this.time.delayedCall(5000, () => player.setScale(1.0));
        const particles = this.add.particles(mushroom.x, mushroom.y, 'kenny-particles', {
            frame: ['smoke_03.png'],
            scale: 0.3,
            lifespan: 500,
            quantity: 3
        });
        this.time.delayedCall(500, () => particles.destroy());
    });

    // 敌人碰撞
    this.physics.add.collider(my.sprite.player, this.enemies, (player, enemy) => {
        let bounceDirection = (player.x < enemy.x) ? -1 : 1;
        player.body.setVelocityX(400 * bounceDirection);
        player.body.setVelocityY(-300);
        player.tint = 0xff0000;
        this.time.delayedCall(200, () => player.tint = 0xffffff);
    });

    // 飞行敌人碰撞
    this.physics.add.collider(my.sprite.player, this.flyingEnemies, (player, enemy) => {
        let bounceDirection = (player.x < enemy.x) ? -1 : 1;
        player.body.setVelocityX(400 * bounceDirection);
        player.body.setVelocityY(-300);
        player.tint = 0xff0000;
        this.time.delayedCall(200, () => player.tint = 0xffffff);
    });

    // 地面碰撞
    this.physics.add.collider(my.sprite.player, this.groundLayer);
}

    update() {
        this.scoreText.setText(`Score: ${this.score}`);
        if (this.missionCompleteText && this.missionCompleteText.visible) return;

        if (my.sprite.player.y > this.map.heightInPixels - 50) { // 假设水面在底部
            // 播放水中粒子效果
            my.vfx.waterSplash.emitParticleAt(my.sprite.player.x, my.sprite.player.y);
            this.sound.play('splash');
            
            // 延迟重生玩家
            this.time.delayedCall(20, () => {
                // 查找重生点
                const spawnPoints = this.map.filterObjects("Objects", obj => obj.name === "spawnPoint");
                const spawnPoint = spawnPoints.length > 0 ? spawnPoints[0] : {x: 30, y: 345};
                
                // 重置玩家位置
                my.sprite.player.x = spawnPoint.x;
                my.sprite.player.y = spawnPoint.y;
                my.sprite.player.setVelocity(0, 0);
            });
        }


        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        if (cursors.left.isDown || cursors.right.isDown) {
    // 在地面移动时播放跑步声
    if (my.sprite.player.body.blocked.down) {
        if (!this.runSound.isPlaying) {
            this.runSound.play();
        }
    } else {
        this.runSound.stop(); // 空中时停止
    }
} else {
    this.runSound.stop(); // 无输入时停止
}

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if(my.sprite.player.body.blocked.down) {
            
            this.jumpCount = 0;  // 重置跳跃计数
            this.canDoubleJump = true;  // 落地后可以二段跳
        }

        if(Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // 普通跳跃（在地面时）
            if(my.sprite.player.body.blocked.down) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                console.log("Play jump sound"); 
                 // 使用初始化好的jumpSound实例
                this.jumpCount = 1;
            } 
            // 二段跳（在空中且已获得能力）
            else if(this.hasDoubleJumpPowerup && this.canDoubleJump && this.jumpCount < 2) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY * 0.9);  // 二段跳稍弱
                this.jumpSound.play();// 使用初始化好的jumpSound实例
                this.jumpCount++;
                this.canDoubleJump = false;  // 本次跳跃周期内不能再二段跳
                
                // 在玩家头顶位置触发一次粒子效果
                my.vfx.doubleJump.emitParticleAt(
                    my.sprite.player.x, 
                    my.sprite.player.y - my.sprite.player.displayHeight/2
                );
            }
        }

        //敌人行走路径
        this.enemies.getChildren().forEach(enemy => {
            // 检查是否超出巡逻范围
            if (Math.abs(enemy.x - enemy.originX) > enemy.patrolRange) {
                enemy.direction *= -1; // 改变方向
            }
            
            // 设置速度
            enemy.setVelocityX(50 * enemy.direction);
            
            // 翻转精灵朝向
            if (enemy.direction > 0) {
                enemy.setFlipX(true); // 向右移动时不翻转
            } else {
                enemy.setFlipX(false); // 向左移动时翻转
            }
            
            // 确保动画持续播放
            
            
            // 检查是否走到平台边缘
            const nextX = enemy.x + (enemy.width * 0.5 * enemy.direction);
            const nextY = enemy.y + enemy.height;
            
            // 获取下一帧位置的瓦片
            const tileBelow = this.groundLayer.getTileAtWorldXY(nextX, nextY);
            
            // 如果没有地面瓦片，转向
            if (!tileBelow || !tileBelow.properties.collides) {
                enemy.direction *= -1;
            }
        });


        // 更新飞行敌人行为
        this.flyingEnemies.getChildren().forEach(flyingEnemy => {
            // 水平移动逻辑
            if (Math.abs(flyingEnemy.x - flyingEnemy.originX) > flyingEnemy.patrolRange) {
                flyingEnemy.direction *= -1; // 改变方向
            }
            
            // 设置水平速度
            flyingEnemy.setVelocityX(80 * flyingEnemy.direction);
            
            // 上下浮动效果 - 使用正弦波创建平滑的上下运动
            const floatY = Math.sin(this.time.now * flyingEnemy.floatSpeed + flyingEnemy.floatOffset) * flyingEnemy.floatAmplitude;
            flyingEnemy.y = flyingEnemy.originY + floatY;
            
            // 翻转精灵朝向
            flyingEnemy.setFlipX(flyingEnemy.direction < 0);
            
            // 可以在这里添加飞行动画
            // flyingEnemy.anims.play('fly', true);
            
        });

    }
}