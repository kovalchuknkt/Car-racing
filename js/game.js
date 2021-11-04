
class Road
{
	constructor(image, y)
	{
		this.x = 0;
		this.y = y;
		this.loaded = false;

		this.image = new Image();
		
		let obj = this;

		this.image.addEventListener("load", function () { obj.loaded = true; });

		this.image.src = image;
	}

	Update(road) 
	{
		this.y += speed; // Изображение будет двигаться вниз с каждым кадром

		if(this.y > window.innerHeight) // если изображение покинуло экран, оно изменит свое положение
		{
			this.y = road.y - canvas.width + speed; // Новая позиция зависит от второго объекта Road
		}
	}
}

class Car
{
	constructor(image, x, y, isPlayer)
	{
		this.x = x;
		this.y = y;
		this.loaded = false;
		this.dead = false;
		this.isPlayer = isPlayer;

		this.image = new Image();

		var obj = this;

		this.image.addEventListener("load", function () { obj.loaded = true; });

		this.image.src = image;
	}

	Update()
	{
		if(!this.isPlayer)
		{
			this.y += speed;
		}

		if(this.y > canvas.height + 50)
		{
			this.dead = true;
		}
	}

	Collide(car)
	{
		var hit = false;

		if(this.y < car.y + car.image.height * scale && this.y + this.image.height * scale > car.y) // Если есть столкновение по y
		{
			if(this.x + this.image.width * scale > car.x && this.x < car.x + car.image.width * scale) // Если есть столкновение по x
			{
				hit = true;
			}
		}

		return hit;
	}

	Move(v, d) 
	{
		if(v == "x") // Двигаемся по x
		{
			d *= 2;

			this.x += d; // Смена позиции

			// Откат изменений, если машина покинула экран
			if(this.x + this.image.width * scale > canvas.width)
			{
				this.x -= d; 
			}
	
			if(this.x < 0)
			{
				this.x = 0;
			}
		}
		else // Двигаемся по y
		{
			this.y += d;

			if(this.y + this.image.height * scale > canvas.height)
			{
				this.y -= d;
			}

			if(this.y < 0)
			{
				this.y = 0;
			}
		}
		
	}
}


const UPDATE_TIME = 1000 / 60;

let timer = null;

let canvas = document.getElementById("canvas"); // Получение холста из DOM
let ctx = canvas.getContext("2d"); // Получение контекста для работы с холстом

let scale = 0.1; // Масштаб автомобилей

Resize(); // Изменение размера холста при запуске

window.addEventListener("resize", Resize); // Меняем размер холста с размером окна

// Запрещаем открывать контекстное меню для улучшения игры на мобильных устройствах
canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; }); 

window.addEventListener("keydown", function (e) { KeyDown(e); }); // Прослушивание событий клавиатуры

let objects = []; // Игровые объекты

let roads = 
[
	new Road("images/road.jpg", 0),
	new Road("images/road.jpg", canvas.width)
]; // Фоны

let player = new Car("images/car.png", canvas.width / 2, canvas.height / 2, true); // Объект игрока

let speed = 5;

Start();


function Start()
{
	if(!player.dead)
	{
		timer = setInterval(Update, UPDATE_TIME); // Обновление игры 60 раз в секунду
	}
	
}

function Stop()
{
	clearInterval(timer); // Остановка игры
	timer = null;
}

function Update() 
{
	roads[0].Update(roads[1]);
	roads[1].Update(roads[0]);

	if(RandomInteger(0, 10000) > 9700) // Создание новой машины
	{
		objects.push(new Car("images/car_red.png", RandomInteger(30, canvas.width - 50), RandomInteger(250, 400) * -1, false));
	}

	player.Update();

	if(player.dead)
	{
		alert("Crash!");
		Stop();
	}

	let isDead = false; 

	for(let i = 0; i < objects.length; i++)
	{
		objects[i].Update();

		if(objects[i].dead)
		{
			isDead = true;
		}
	}

	if(isDead)
	{
		objects.shift();
	}

	let hit = false;

	for(let i = 0; i < objects.length; i++)
	{
		hit = player.Collide(objects[i]);

		if(hit)
		{
			alert("Crash!");
			Stop();
			player.dead = true;
			break;
		}
	}

	Draw();
}

function Draw() // Работа с графикой
{
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем холст

	for(let i = 0; i < roads.length; i++)
	{
		ctx.drawImage
		(
			roads[i].image, // Изображение
			0, // Первый X на изображении
			0, // Первый Y на изображении
			roads[i].image.width, // Конец X на изображении
			roads[i].image.height, // Конец Y на изображении
			roads[i].x, // X на холсте
			roads[i].y, // Y на холсте
			canvas.width, // Ширина на холсте
			canvas.width // Высота на холсте
		);
	}

	DrawCar(player);

	for(var i = 0; i < objects.length; i++)
	{
		DrawCar(objects[i]);
	}
}

function DrawCar(car)
{
	ctx.drawImage
	(
		car.image, 
		0, 
		0, 
		car.image.width, 
		car.image.height, 
		car.x, 
		car.y, 
		car.image.width * scale, 
		car.image.height * scale 
	);
}

function KeyDown(e)
{
	switch(e.keyCode)
	{
		case 37: // Левый
			player.Move("x", -speed);
			break;

		case 39: // Правый
			player.Move("x", speed);
			break;

		case 38: // Вверх
			player.Move("y", -speed);
			break;

		case 40: // Вниз
			player.Move("y", speed);
			break;

		case 27: // Esc
			if(timer == null)
			{
				Start();
			}
			else
			{
				Stop();
			}
			break;
	}
}

function Resize()
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function RandomInteger(min, max) 
{
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}