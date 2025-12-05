function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    collision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}

class Player{
    constructor(x, y, width, height){
        this.rect = new Rectangle(x, y, width, height);
        this.velocityY = 0;  
        this.gravity = 0.1;  
        this.jumpForce = -6; 
        this.isJumping = false; 
        this.images = [];
        this.imagesSrc = ['images/player1.png','images/player2.png']; 
        this.imagesLoaded = []; 
        this.currentFrame = 0;
        
        for (let index = 0; index < this.imagesSrc.length; index++) {
            this.images.push(new Image());
            this.images[index].src = this.imagesSrc[index];
            this.imagesLoaded.push(false);
            
            this.images[index].onload = () => {
                this.imagesLoaded[index] = true;
            };
        }
    }

    jump(){
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }

    update(sol){
        this.velocityY += this.gravity;
        this.rect.y += this.velocityY;

        if (this.rect.collision(sol)) {
            this.rect.y = sol.y - this.rect.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }
    getCurrentImage() {
        if (this.imagesLoaded[this.currentFrame]) {
            return this.images[this.currentFrame];
        }
        return null;
    }
}

class Enemy{
    constructor(x, y, width, height,type){
        this.rect = new Rectangle(x, y, width, height);
        this.speed = 3;
        this.imagesSrc = ['images/rock1.png','images/rock2.png']; 
        this.imagesLoaded = []; 
        this.currentFrame = randomInt(0, 1);
        this.type = type;
        var index = 0
        if (type == "small"){
            index = 0;
        }if(type == "big"){
            index = 1;
        }
        this.image = new Image();
        this.image.src = this.imagesSrc[index];
        this.imageLoaded = false;
        
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }
    
    update(){
        this.rect.x -= this.speed;
    }
    
    estHorsEcran(){
        return this.rect.x + this.rect.width < 0;
    }

    getCurrentImage() {
        if (this.imageLoaded) {
            return this.image;
        }
        return null;
    }
} 

class Game {
    constructor(largeur = 800, hauteur = 300, parent = document.body) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = largeur;
        this.canvas.height = hauteur;
        this.ctx = this.canvas.getContext('2d');
        this.play = false;
        this.touches = {};
        this.isGameOver = false; 

        this.spriteTimer = 0;
        
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = randomInt(150,300);

        this.parent = parent

        

        this.canvas.style.border = '2px solid #333';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '20px auto';
        this.canvas.style.backgroundColor = '#f0f0f0';

        this.initialiserClavier();
    }

    initialiserClavier() {
        window.addEventListener('keydown', (e) => {
            this.touches[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.touches[e.key] = false;
        });
    }
    
    toucheAppuyee(touche) {
        return this.touches[touche] === true;
    }
    
    uneToucheAppuyee() {
        return Object.values(this.touches).some(val => val === true);
    }

    effacer() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    dessinerRectangle(rect, couleur = '#000') {
        this.ctx.fillStyle = couleur;
        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    dessinerSprite(obj, couleurSecours = '#000') {
        const img = obj.getCurrentImage();
        if (img) {
            this.ctx.drawImage(img, obj.rect.x, obj.rect.y, obj.rect.width, obj.rect.height);
        } else {
            this.dessinerRectangle(obj.rect, couleurSecours);
        }
    }

    dessinerTexte(texte, x, y, couleur = '#000', taille = 20) {
        this.ctx.fillStyle = couleur;
        this.ctx.font = `${taille}px Arial`;
        this.ctx.fillText(texte, x, y);
    }

    mettreEnPause() {
        this.play = false;
        if (this.parent && this.parent.contains(this.canvas)) {
             this.parent.removeChild(this.canvas);
        }
        this.parent = null
    }

    reprendre(sol, player, inputContainer, inputElement) {
        if (!this.play) {
            this.play = true;
            inputContainer.appendChild(this.canvas);
            console.log(this.parent)
            this.parent = inputContainer
        }
    }
    
    spawnEnnemi(sol) {

        const types = ["small","big"]
        let i = randomInt(0,1);
        const width = 40 +i*30;
        const height = 40 +i*30;
        const x = this.canvas.width;
        const y = sol.y - height;

        
        this.enemies.push(new Enemy(x, y, width, height,types[i]));
    }
    
    demarrer(sol, player, inputElement) {
        const boucleJeu = () => {
            if (this.play) {
                this.effacer();

                if (this.isGameOver) {
                    this.dessinerRectangle(sol, '#8B4513');
                    this.dessinerTexte('GAME OVER!', this.canvas.width/2 - 80, this.canvas.height/2, '#ff0000', 40);
                    requestAnimationFrame(boucleJeu);
                    return; 
                }
                
                this.spriteTimer++;
                if (this.spriteTimer >= 50) {
                    player.currentFrame = (player.currentFrame + 1) % player.images.length;
                    this.spriteTimer = 0;
                }
                
                if (jeu.uneToucheAppuyee()) {
                    player.jump();
                }
                
                player.update(sol);
                
                this.spawnTimer++;
                if (this.spawnTimer >= this.spawnInterval) {
                    this.spawnEnnemi(sol);
                    this.spawnTimer = 0;
                    this.spawnInterval = randomInt(150,300);
                }
                
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    this.enemies[i].update();
                    
                    if (this.enemies[i].estHorsEcran()) {
                        this.enemies.splice(i, 1);
                    }
                    else if (this.enemies[i].rect.collision(player.rect)) {
                        
                        if (inputElement && inputElement.value.length > 0) {
                            inputElement.value = inputElement.value.slice(0, -1);
                        }
                        
                        this.isGameOver = true;
                        
                        setTimeout(() => {
                            this.enemies = []; 
                            this.spawnTimer = 0;
                            player.rect.x = 50; 
                            player.rect.y = sol.y - player.rect.height;
                            player.velocityY = 0; 
                            player.isJumping = false;
                            
                            this.isGameOver = false; 

                        }, 2000);
                    }
                }
                
                this.dessinerRectangle(sol, '#8B4513');
                this.dessinerSprite(player, '#4ecdc4');
                
                this.enemies.forEach(enemy => {
                    this.dessinerSprite(enemy, '#ff6b6b');
                });
            }
            
            requestAnimationFrame(boucleJeu);
        };
        boucleJeu();
    }
}



var nom = document.querySelector("#nom");
const jeu = new Game(800, 300, nom);
const sol = new Rectangle(0, jeu.canvas.height - 0.10 * jeu.canvas.height, jeu.canvas.width, 0.10 * jeu.canvas.height);
var player = new Player(50, sol.y - 80, 70, 90);


const inputs = document.querySelectorAll('.inputgame');
const inputsContainers = document.querySelectorAll('.gameRequired');
console.log(inputs)


jeu.demarrer(sol, player, inputs[0]); 

jeu.mettreEnPause(); 


for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const inputContainer = inputsContainers[i];
    
    input.addEventListener("focus", () => {
        jeu.reprendre(sol, player, inputContainer, input);
    });

    input.addEventListener("blur", () => {
        jeu.mettreEnPause()
    });
}