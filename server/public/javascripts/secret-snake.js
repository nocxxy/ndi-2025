/**
 * @fileoverview Secret Snake Game logic
 * Ported from provided script.js
 */

(function() {
    let applePos = { x: 0, y: 0 };
    
    // Sound wrapper to prevent errors if files missing
    class SafeAudio {
        constructor(path) {
            try {
                this.audio = new Audio(path);
            } catch(e) {
                this.audio = null;
            }
        }
        play() {
            if (this.audio) return this.audio.play().catch(() => {});
            return Promise.resolve();
        }
    }

    const sonPomme = new SafeAudio("/sounds/manger.mp3"); // Adjusted path
    const Over = new SafeAudio("/sounds/c_nul_homer.mp3");
    const Win = new SafeAudio("/sounds/aplausos.mp3");
    let compteur = 0;

    const scoreEl = document.getElementById("score");
    if (scoreEl) scoreEl.textContent = "Score: " + compteur;

    function apple(x, y, snake) {
      let valide = false;

      while (!valide) {
        applePos.x = Math.floor(Math.random() * x);
        applePos.y = Math.floor(Math.random() * y);

        valide = true;
        for (let i = 0; i < snake.length; i++) {
          if (applePos.x === snake[i][0] && applePos.y === snake[i][1]) {
            valide = false;
          }
        }
      }
    }

    function creerMatrice(n, m) {
      const matriceDiv = document.getElementById("snake_table");
      if (!matriceDiv) return;
      matriceDiv.innerHTML = "";

      for (let i = 0; i < n; i++) {
        const ligneDiv = document.createElement("div");
        ligneDiv.className = "ligne";

        for (let j = 0; j < m; j++) {
          const celluleDiv = document.createElement("div");
          celluleDiv.className = "cellule";
          celluleDiv.id = `${i}-${j}`; 
          ligneDiv.appendChild(celluleDiv);
        }

        matriceDiv.appendChild(ligneDiv);
      }
    }

    function compareTete(tab) {
      for (let i = 1; i < tab.length; i++) {
        if (tab[0][0] === tab[i][0] && tab[0][1] === tab[i][1]) {
          return true;
        }
      }
      return false;
    }

    function estSortie(taille, tete) {
      return (
        tete[0] < 0 || tete[0] >= taille ||
        tete[1] < 0 || tete[1] >= taille
      );
    }

    function mouvement(snake, grow = false) {
      let newSnake = [[...snake[0]]];

      for (let i = 1; i < snake.length; i++) {
        newSnake[i] = [...snake[i - 1]];
      }

      if (grow) {
        newSnake.push([...snake[snake.length - 1]]);
      }

      return newSnake;
    }

    function afficheSnake(snake, direction) {
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          const cellule = document.getElementById(`${i}-${j}`);
          if(cellule) {
              cellule.style.backgroundColor = "#111";
              cellule.style.borderRadius = "0";
              cellule.textContent = "";
              cellule.style.boxShadow = "";
          }
        }
      }

      for (let i = 0; i < snake.length; i++) {
        const cellule = document.getElementById(`${snake[i][0]}-${snake[i][1]}`);
        if (!cellule) continue;

        if (i === 0) {
          cellule.style.backgroundColor = "#0a7a26";
          cellule.style.boxShadow = "0 0 10px rgba(10, 122, 38, 0.8)";

          switch (direction) {
            case "up":
              cellule.style.borderRadius = "50% 50% 0 0";
              cellule.textContent = "• •";
              cellule.style.fontSize = "10px";
              cellule.style.letterSpacing = "5px";
              break;
            case "down":
              cellule.style.borderRadius = "0 0 50% 50%";
              cellule.textContent = "• •";
              cellule.style.fontSize = "10px";
              cellule.style.letterSpacing = "5px";
              break;
            case "left":
              cellule.style.borderRadius = "50% 0 0 50%";
              cellule.textContent = "••";
              cellule.style.fontSize = "10px";
              break;
            case "right":
              cellule.style.borderRadius = "0 50% 50% 0";
              cellule.textContent = "••";
              cellule.style.fontSize = "10px";
              break;
          }
        } else {
          cellule.style.backgroundColor = "#34c759";
          cellule.style.borderRadius = "3px";
          cellule.style.boxShadow = "0 0 5px rgba(52, 199, 89, 0.5)";
        }
      }

      const pomme = document.getElementById(`${applePos.x}-${applePos.y}`);
      if (pomme) {
          pomme.textContent = "🍎";
          pomme.style.fontSize = "20px";
          pomme.style.animation = "pulse 1s infinite";
      }
    }

    function main() {
      const taille = 20;
      const gameOverScreen = document.getElementById("game_over");
      const restartButtonGameOver = document.getElementById("restart_button_gameover");
      const restartButtonWin = document.getElementById("restart_button_win");
      const finalScoreElement = document.getElementById("final_score");
      const winScreen = document.getElementById("You_win");
      let snake = [[0, 2], [0, 1], [0, 0]];
      let direction = "right";

      apple(taille, taille, snake);
      creerMatrice(taille, taille);
      afficheSnake(snake, direction);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'z' && direction !== "down") direction = "up";
        if (e.key === 's' && direction !== "up") direction = "down";
        if (e.key === 'q' && direction !== "right") direction = "left";
        if (e.key === 'd' && direction !== "left") direction = "right";
      });

      if(restartButtonGameOver) restartButtonGameOver.addEventListener("click", () => {
        location.reload(); 
      });

      if(restartButtonWin) restartButtonWin.addEventListener("click", () => {
        location.reload(); 
      });

      const timer = setInterval(() => {
        let head = [...snake[0]];
        switch(direction) {
          case "up": head[0]--; break;
          case "down": head[0]++; break;
          case "left": head[1]--; break;
          case "right": head[1]++; break;
        }

        snake = mouvement(snake);
        snake[0] = head;

        if (estSortie(taille, snake[0]) || compareTete(snake)) {
          if(finalScoreElement) finalScoreElement.textContent = "Score final: " + compteur;  
          if(gameOverScreen) gameOverScreen.style.display = "flex";
          Over.play();
          clearInterval(timer);
          return;
        }

        if (snake.length === 23) {
          if(winScreen) winScreen.style.display = "flex";
          Win.play();
          clearInterval(timer);
          return;
        }

        if (snake[0][0] === applePos.x && snake[0][1] === applePos.y) {
          snake.push([...snake[snake.length - 1]]);
          compteur++;
          const scEl = document.getElementById("score");
          if(scEl) scEl.textContent = "Score: " + compteur;
          sonPomme.play();
          apple(taille, taille, snake);
          creerMatrice(taille, taille);
        }

        afficheSnake(snake, direction);
      }, 250);
    }

    // Init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
