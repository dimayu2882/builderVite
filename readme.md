# Работа с билдером

## Установка билдера для плееблов

- Скачиваем и устанавливаем [**nodejs**](https://nodejs.org/ru). Берём ту версию, что рекомендована для большинства.
- Клонируем себе на компьютер билдер.
- Чтобы установить все нужные модули, вызываем в корне папки в консоли:
```   
    npm install
```

## Работа с шаблоном

Структура проекта следующая:
- в **assets/images/** кладутся изображения
- в **assets/sounds/** звуки
- в **src/** js-файлы

Для начала работы с билдером в режиме разработки вызываем:
```
    npm run dev
```
Наш проект откроется в браузере. Все изменения будут автоматически обновлять страницу браузера.
Чтобы закончить работу либо закрываем консоль, либо в консоли нажимаем Ctrl+C.

## Картинки

При добавлении или обновлении картинок в папке **assets/images/** 
автоматически все картинки сначала конвертируются в формат webp, после сжимаются и конвертируются в формат base

## Сборка спрайтшитов и работа с ними

Для сборки нескольких изображений в один спрайтшит исползуется следующая команда:
```
    npm run pack 'имя папки, лежащей в images'
```
Пример: у нас в images есть папка fireSequnce (assets/images/fireSequnce). Вызываем в консоли:
```
    npm run pack fireSequnce
```

После чего, папка **fireSequnce** переименуется в **#fireSequnce** (решётка в начале названия папки или файла сообщает билдеру, чтобы он игнорировал этот ассет / папку ассетов и не включал её в итоговый билд). В папке **assets** появится папка **sheets**, содержащая собранный спрайтшит. 

Сборка осуществляется с помощью пакета [**free-tex-packer**](https://free-tex-packer.com/)

## Итоговая сборка

Для сборки плеебла под площадки и превьюшек для тестирования, используется команда:
```
    npm run build
```
В корне проекта появится папка dist в которой будут собранные версии плеебла и превью

===========================================================================

# Работа в коде шаблона
Входной точкой кода, является функция **init()** в **src/Main.mjs**

## Глобальный обьект **app** 

Весь функционал шаблона находится в глобальном обьекте **app** (src/modules/Application2D.js):
- **app.assets** - обьект со всеми ассетами, закодированными в base64
    - **app.assets.images** - обьект с экземплярами класса Image.
    - **app.assets.audios** - обьект с экземплярами класса Audio.
    - **app.assets.sheets** - обьект с распарсеными json файлами спрайтшитов.

- **app.pixi** (src/modules/managers/PIXIManager.mjs) - менеджер для упрощения работы с **PIXIjs** (версия 7.4.2 ) 

### Создание нового спрайта PIXI.Sprite:
```
    app.pixi.sprite(imageName, options);
```
**`imageName`** {String} - имя изображения из папки **assets/images**. Поддерживает вложенность. Если, например, картинка лежит в папке assets/images/packshot/logo.png,
то спрайт содаем так:
```
    app.pixi.sprite('packshot/logo');
```
расширение файла .png или .jpg указывать не нужно.

Также **imageName** может быть именем frame из спрайтшита, собраного с помощью пакера спрайтшитов (смотреть выше)

**`options`** {Object} - свойтсва спрайта, которые поддерживает PIXI.Sprite
Пример:
```
    app.pixi.sprite('imageName', {
        scale: 0.5,
        x: 100,
        y: 100,
        alpha: 0.5,
        anchor: {x: 0.5, y: 1},
        eventMode: 'static'
    });
```

> [!IMPORTANT]
> Созданная для спрайта текстура (PIXI.Texture) кешируется и используется повторно для создания последующих спрайтов с этим же изображением, если вдруг понадобиться уникальная текстура, используйте PIXI.Texture.clone(); 

### Создание нового контейнера PIXI.Container:
```
    app.pixi.container(options);
```
**`options`** {Object} - свойтсва контейнера, которые поддерживает PIXI.Container (пример выше)

### Создание анимированного спрайта PIXI.AnimatedSprite:
```
    app.pixi.animation(sheetName, options);
```
**`sheetName`** {String} - имя спрайтшита из папки **assets/sheets**. 
**`options`** {Object} - свойтсва анимированного спрайта, которые поддерживает PIXI.AnimatedSprite (пример выше)
дополнительная опция **autoPlay** {Boolean} - начинать проигрывание анимации сразу или нет

Если в json файле спрайтшита не прописан порядок кадров в анимации, то он формируется автоматически, путем сортировки массива имён фреймов, стандартной функцией Array.sort(); Так что, чтобы порядок соблюдался, лучше именовать фреймы следующим образом, либо:
```
    01.png, 02.png, 03.png, 04.png...
```
либо:
```
    frame_01.png, frame_02.png, frame_03.png, frame_04.png...
```

### Создание новой текстуры PIXI.Texture:
```
    app.pixi.texture(imageName);
```
**`imageName`** {String} - имя изображения из папки **assets/images**. (смотреть выше: app.pixi.sprite)

### Создание нового спрайтшита PIXI.Spritesheet:
```
    app.pixi.sheet(sheetName);
```
**`sheetName`** {String} - имя спрайтшита из папки **assets/sheets**. 


- **app.sound** (src/modules/managers/SoundManager.mjs) - менеджер для упрощения работы с **howler** (версия 2.2.4 ) 

### Проиграть аудио:
```
    app.sound.play(soundName, options);
```
**`soundName`** {String} - имя аудио из папки **assets/sounds**.
**`options`** - {loop = false, volume, rate}
    **loop** {Boolean} - зацикленность,
    **volume** {Number}: 0-1 - громкость,
    **rate** {Number} - скорость воспроизведения

### Проиграть аудио, если оно уже не играет:
```
    app.sound.playLone(soundName, options);
```
**`soundName`** {String} - имя аудио из папки **assets/sounds**.
**`options`** - {loop = false, volume, rate}
    **loop** {Boolean} - зацикленность,
    **volume** {Number}: 0-1 - громкость,
    **rate** {Number} - скорость воспроизведения

### Остановить проигрывание аудио:
```
    app.sound.stop(soundName);
```
**`soundName`** {String} - имя аудио из папки **assets/sounds**.

### Заглушить все звуки:
```
    app.sound.mute();
```

### Убрать заглушение всех звуков:
```
    app.sound.unmute();
```

> [!IMPORTANT]
> Сколько раз было вызвано mute(), столько же раз нужно вызвать и unmute();

Остальные функции **fade, fadeIn, fadeOut, isPlaying** смотреть в **src/modules/managers/SoundManager.mjs**

- **app.resize** (src/modules/managers/ResizeManager.mjs) - менеджер для отслеживания ресайзов экрана и смены ориентации

Добавить функцию-слушатель для отслеживания ресайзов экрана и смены ориентации:
```
    app.resize.add(resizeFunction);
```
**`resizeFunction`** - функция-слушатель

Удалить функцию-слушатель для отслеживания ресайзов экрана и смены ориентации:
```
    app.resize.remove(resizeFunction);
```
**`resizeFunction`** - функция-слушатель

- **app.loop** (src/modules/managers/GameLoopManager.mjs) - менеджер для управления game loop функциями 

Добавить функцию-слушатель, которая будет вызыааться 40 раз в секунду:
```
    app.loop.add(updateFunction);
```
**`updateFunction`** {Function} - функция-слушатель

Удалить функцию-слушатель из менеджера:
```
    app.loop.remove(updateFunction);
```
**`updateFunction`** {Function} - функция-слушатель

- **app.eventEmitter** - экземпляр класса EventEmitter для передачи и отслеживания событий между классами в плеебле

Подписаться на событие:
```
    app.eventEmitter.on(eventName, handlerFunction);
```
**`eventName`** {String} - название события
**`handlerFunction`** {Function} - функция-слушатель события

Отписаться от события:
```
    app.eventEmitter.off(eventName, handlerFunction);
```
**`eventName`** {String} - название события
**`handlerFunction`** {Function} - функция-слушатель события

Отправить событие:
```
    app.eventEmitter.emit(eventName, [...arguments]);
```
**`eventName`** {String} - название события
**`arguments`** {*} - аргументы, которые передаются вместе с событием

- **app.stage** - доступ к PIXI.Application().stage;

- **app.isPortrait** {Boolean} - портретная ли ориентация?
