
var MonoproLayer = cc.Layer.extend({
    srcObj : {
        bird : null
      , bg1 : null
      , bg2 : null
      , block1 : null
      , block2 : null
      , bgm : null
      , scoreLabel : null
      , birdSpeed : 0
      , score : 0
    },
    // 초기화 작업 
    ctor : function() {
        // 1. super init first
        this._super();

        ///////////////////////////////////////////
        // 1. 캐릭터에 대한 초기작업 수행
        ///////////////////////////////////////////
        var sourceObj = this.srcObj;
        var size = cc.winSize;

        sourceObj.bird = new cc.Sprite(res.pngBird);
        sourceObj.bird.attr({
             x: size.width  / 2
           , y: size.height / 2
           , scale: 0.5
           , rotation: 0
        });
        this.addChild(sourceObj.bird, 10);

        // 캐릭터 애니메이션 작성
        sourceObj.bird.runAction(
            // 1), 2), 3) 을 순서대로 시행
            cc.sequence(
                // 1) 0.01초 4배로 크게 만듬
                cc.scaleTo(0.01, 4, 4)
                // 2), 3) 을 동시에 시행
              , cc.spawn(
                    // 2) 0.3초 360도 회전
                    cc.rotateBy(0.3, 360)
                    // 3) 0.3초 원래 크기로 돌림 
                  , cc.scaleTo(0.3, 1, 1)
                )
            )
        );

        ///////////////////////////////////////////
        // 2. 배경화면 작업
        ///////////////////////////////////////////

        sourceObj.bg1 = new cc.Sprite(res.pngBgStar);
        sourceObj.bg1.setAnchorPoint(0, 0);
        sourceObj.bg1.setPosition(0, 0);
        this.addChild(sourceObj.bg1, 1);

        sourceObj.bg2  = new cc.Sprite(res.pngBgStar);
        sourceObj.bg2.setAnchorPoint(0, 0);
        sourceObj.bg2.setPosition(800, 0);
        this.addChild(sourceObj.bg2, 1);
        
        ///////////////////////////////////////////
        // 3. Block 작업
        ///////////////////////////////////////////

        sourceObj.block1 = new cc.Sprite(res.pngBlock);
        sourceObj.block1.setAnchorPoint(0, 0);
        sourceObj.block1.setPosition(600, 0);
        this.addChild(sourceObj.block1, 2);

        sourceObj.block2  = new cc.Sprite(res.pngBlock);
        sourceObj.block2.setAnchorPoint(0, 1);
        sourceObj.block2.setPosition(700, 450);
        // sourceObj.block2.setScale(1.0, 0.8);
        this.addChild(sourceObj.block2, 2);
        
        ///////////////////////////////////////////
        // 4. BGM
        ///////////////////////////////////////////

        sourceObj.bgm = cc.audioEngine;
        //sourceObj.bgm.playMusic(res.mp3Bgm, true);

        ///////////////////////////////////////////
        // 5. Label -> score
        ///////////////////////////////////////////

        sourceObj.scoreLabel = new cc.LabelTTF("SCORE", "Arial", 20);
        sourceObj.scoreLabel.setAnchorPoint(0, 0);
        sourceObj.scoreLabel.setPosition(50, 400);
        this.addChild(sourceObj.scoreLabel, 8);


        ///////////////////////////////////////////
        // 6. Event Listener
        ///////////////////////////////////////////

        cc.eventManager.addListener({
            event : cc.EventListener.TOUCH_ONE_BY_ONE
          , swallowTouches : true
          , onTouchBegan : this.onTouchBegan
          // , onTouchMoved : this.onTouchMoved
          // , onTouchEnded : this.onTouchEnded
        }, this);

       this.scheduleUpdate();

        return true;
    },
    onTouchBegan : function(touch, event) {
        var sound = cc.audioEngine;
        sound.playEffect(res.mp3Swing);

        var target = event.getCurrentTarget();
        var sourceObj = target.srcObj;

        sourceObj.birdSpeed = 5;
        sourceObj.bird.runAction(
            cc.sequence(
                cc.rotateTo(0.01, -10)
              , cc.rotateTo(1.0, 20)
            )
        );

        return true;
    },
    // scheduleUpdate() 메소드 수행에 의해 매 프레임마다 수행되는 메소드
    update : function(touch, event) {

        ///////////////////////////////////////////
        // 1. 배경 화면 위치 지정 & 반복
        ///////////////////////////////////////////
        var sourceObj = this.srcObj;

        sourceObj.bg1.setPosition(
            sourceObj.bg1.getPosition().x - 1
          , sourceObj.bg1.getPosition().y
        );
        sourceObj.bg2.setPosition(
            sourceObj.bg2.getPosition().x - 1
          , sourceObj.bg2.getPosition().y
        );
 
        if (sourceObj.bg1.getPosition().x < -800) {
            sourceObj.bg1.setPosition(800, 0);
        }
        if (sourceObj.bg2.getPosition().x < -800) {
            sourceObj.bg2.setPosition(800, 0);
        }
 

        ///////////////////////////////////////////
        // 2. 블록 위치 지정 & 반복
        ///////////////////////////////////////////
        sourceObj.block1.setPosition(
            sourceObj.block1.getPosition().x - 2
          , sourceObj.block1.getPosition().y
        );
        sourceObj.block2.setPosition(
            sourceObj.block2.getPosition().x - 2
          , sourceObj.block2.getPosition().y);
 
        if (sourceObj.block1.getPosition().x < -50) {
            sourceObj.block1.setPosition(900, 0);
        }
        if (sourceObj.block2.getPosition().x < -50) {
            sourceObj.block2.setPosition(1100, 450);
        }

        ///////////////////////////////////////////
        // 3. 캐릭터 위치 변경 (y측 위치변경: 낙하속도)
        ///////////////////////////////////////////
        var pos = sourceObj.bird.getPosition();
        sourceObj.birdSpeed -= 0.1;
 
        sourceObj.bird.setPosition(pos.x, pos.y + sourceObj.birdSpeed);

        ///////////////////////////////////////////
        // 4. 점수 측정
        /////////////////////////////////////////// 
        sourceObj.score++;
        sourceObj.scoreLabel.setString("SCORE:" + sourceObj.score + "ｍ");
 

        ///////////////////////////////////////////
        // 5. 게임 오버 체크
        /////////////////////////////////////////// 
        var birdRect = sourceObj.bird.getBoundingBox();
        var block1Rect = sourceObj.block1.getBoundingBox();
        var block2Rect = sourceObj.block2.getBoundingBox();
 
        if (cc.rectIntersectsRect(birdRect, block1Rect)) {
            this.gameOver();
        }
        if (cc.rectIntersectsRect(birdRect, block2Rect)) {
            this.gameOver();
        }
 
        if (pos.y <= 40) {
            this.gameOver();
        }
    },
    gameOver : function() {
        this.unscheduleUpdate();

        var sound = cc.audioEngine;
        sound.playEffect(res.mp3Hit);

        var sourceObj = this.srcObj;
        sourceObj.bgm.stopMusic();

        cc.eventManager.removeAllListeners();

        var gameover = new cc.Sprite(res.pngGamover);
        gameover.setPosition(800/2, 450/2);
        this.addChild(gameover, 20);



    }

});

var MonoproScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        // 내부 init() 메소드 수행?
        var layer = new MonoproLayer();
        // layer.init();
        
        this.addChild(layer);
    }
});

