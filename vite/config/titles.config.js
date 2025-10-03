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
	playable: {
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
