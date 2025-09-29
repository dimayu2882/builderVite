const DEFAULT_PLATFORMS = [
	'google',
	'ironsource',
	'facebook',
	'mintegral',
	'mraid',
	'mraidbtn',
	'liftoff',
	'moloco',
	'vungle'
];


/**
 * client - название папки с клиентом
 * titleKey - ключевое слово по которому парсится папка с плееблом. То, что идеи перед номером плейбла: solitaire0001
 * folderName - основа для названия папок при сборке площадок
 * (опц) templateName - шаблон для имени конечного билда (см. пример tripledot_woodoku_blast)
 */
const titlesConfig = {
	
	totalgames_goodville: {
		client: 'totalgames',
		titleKey: 'goodville',
		folderName: 'PA_',
		store: {
			ios: 'https://apps.apple.com/app/id1459249040',
			android: 'https://play.google.com/store/apps/details?id=com.goodville.goodgame'
		},
		platforms: DEFAULT_PLATFORMS
	},
	
	artikmedia_ludus: {
		client: 'artikmedia',
		titleKey: 'ludusCards',
		folderName: 'LudusCards_',
		store: {
			ios: 'https://apps.apple.com/ru/app/ludus-%D0%BC%D0%B5%D1%80%D0%B6-%D0%B0%D1%80%D0%B5%D0%BD%D0%B0-pvp/id6503294770',
			android: 'https://play.google.com/store/apps/details?id=com.smarttkm.ludus'
		},
		platforms: DEFAULT_PLATFORMS
	},
	
	artikmedia_milk: {
		client: 'artikmedia',
		titleKey: 'milkFarm',
		folderName: 'milkFarm_',
		store: {
			ios: 'https://apps.apple.com/us/app/milk-farm-tycoon/id1603340008',
			android: 'https://play.google.com/store/apps/details?id=com.eastsidegames.milkinc'
		},
		platforms: DEFAULT_PLATFORMS
	}
};

/**
 * client - название папки с клиентом
 * titleKey - ключевое слово по которому парсится папка с плееблом. То, что идеи перед номером плейбла: solitaire0001
 * folderName - основа для названия папок при сборке площадок
 * (опц) templateName - шаблон для имени конечного билда (см. пример tripledot_woodoku_blast)
 */

export default titlesConfig;
