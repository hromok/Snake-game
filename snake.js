// Налаштовуємо полотно
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Отримуємо ширину та висоту з елемента canvas
var width = canvas.width;
var height = canvas.height;

// Опрацьовуємо блоки width та height
var blockSize = 10;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;

// Задаємо рахунок на 0
var score = 0;

// Малюємо межі
var drawBorder = function () {
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
}

// Малюємо рахунок у верхньому лівому куті
var drawScore = function () {
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "Black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, blockSize, blockSize);
};

// Висвітлюємо текст "Game Over" 
var gameOver = function () {
    playing = false;
    ctx.font = "60px Comic Sans MS"
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", width / 2, height / 2);
};

// Малюємо коло (за допомогою функції)
var circle = function (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

// Конструктор Block
var Block = function (col, row) {
    this.col = col;
    this.row = row;
};

// Малюємо квадрат у локації блока
Block.prototype.drawSquare = function (color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
};

// Малюємо коло на локації блока
Block.prototype.drawCircle = function (color) {
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
};

// Перевіряємо, чи цей блок не знаходиться в одній локації з іншим блоком
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};

// Конструктор Snake
var Snake = function () {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(6, 5)
    ];

    this.direction = "right";
    this.nextDirection = "right";
}

// Малюємо квадрат для кожного сегмента тіла змійки
Snake.prototype.draw = function () {
    for (var i = 0; i < this.segments.length; i++) {
        this.segments[0].drawSquare("Green")
        if (i % 2) {
            this.segments[i].drawSquare("Blue")
        } else {
            this.segments[i].drawSquare("Yellow")
        }
    }
};

// Створюємо нову голову та додаємо її до початку змійки, щоб переміщати її в поточному напрямку
Snake.prototype.move = function () {
    var head = this.segments[0];
    var newHead;

    this.direction = this.nextDirection;

    if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
}

if (this.checkColission(newHead)) {
    gameOver();
    return;
}

this.segments.unshift(newHead);

if (newHead.equal(apple.position)) {
    score++;
    apple.move(this.segments);
    animationTime--;
} else {
    this.segments.pop();
}
};

// Пеервіряємо, чи нова голова змійки зіткнулася зі стіною або власним тілом
Snake.prototype.checkColission = function (head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks - 1);
    var bottomCollision = (head.row === heightInBlocks - 1);

    var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    var selfCollision = false;

    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }
    
    return wallCollision || selfCollision;
};

// Задаємо наступний напрям руху змійки на основі клавіатури
Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === "up" && newDirection === "down") {
        return;
    } else if (this.direction === "right" && newDirection === "left") {
        return;
    } else if (this.direction === "down" && newDirection === "up") {
        return;
    } else if (this.direction === "left" && newDirection === "right") {
        return;
    }

    this.nextDirection = newDirection;
}

// Конструктор Apple
var Apple = function () {
    this.position = new Block(10, 10);
};

// Малюємо коло на локації яблучка
Apple.prototype.draw = function () {
    this.position.drawCircle("LimeGreen");
};

// Переміщуємо яблуко на нову випадкову позицію
Apple.prototype.move = function (occupiedBlocks) {
    var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    this.position = new Block(randomCol, randomRow);

    // Перевіряємо чи яблуко не було намальовано там де знаходться змійка
    for (var i = 0; i < occupiedBlocks.length; i++) {
        if (this.position.equal(occupiedBlocks[i])) {
            this.move(occupiedBlocks);
            return;
        }
    }
};

// Створюємо об'єкти змійки та яблука, та змінну playing для Game Over
var playing = true;
var snake = new Snake();
var apple = new Apple();

// Передаємо функцію анімації
var animationTime = 100;
var gameLoop = function () {
    ctx.clearRect(0, 0, width, height);
    drawScore();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();

    if (playing) {
        setTimeout(gameLoop, animationTime);
    }
}

// Запускаємо гру
gameLoop();

// Конвертуємо ключ-коди в напрямки
var directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

// Обробник keydown для маніпуляції напрямками, заданами натисканням клавіш
$("body").keydown(function (event) {
    var newDirection = directions[event.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
});