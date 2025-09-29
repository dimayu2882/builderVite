import { gameStages, labels } from '../utils/enums.mjs';

export default class GameManager {
	constructor() {
		this.app = app;
		this.gameScene = app.main.gameScene;
		this.world = this.gameScene.world;
		this.background = this.gameScene.background;
		this.customers = this.gameScene.customers;
		this.cows = this.gameScene.cows.cows;
		this.sceneStart = this.gameScene.display.getChildByName(labels.sceneStart);
		this.tutorHand = this.gameScene.display.getChildByName(labels.tutorHand);
		this.cars = this.gameScene.cars;
		this.milk = this.gameScene.milk;
		this.statusBar = this.gameScene.statusBar;
		this.statusHealth = this.gameScene.statusHealth;
		this.cowBtn = this.gameScene.cowBtn;
		this.truckBtn = this.gameScene.truckBtn;
		this.packshot = this.gameScene.packshot;
		this.fail = this.gameScene.fail;
		
		this.step = null;
		this.moveFront = true;
		
		this.initGame();
		
		app.resize.add(this.#onResize);
	}
	
	#onResize = () => {
		this.moveCameraToPositionByStep(0);
	};
	
	initGame = () => {
		this.gameStage = gameStages.stageStart;
		this.currentProgress = 0;
		this.upgradeCowCount = false;
		this.inactivityTimeout = null;
		this.inactivityLimit = 5000; //5000
		this.speedCar = 300; //300
		this.targets = [];
		
		console.log(this.gameScene, this.cows, this.fail, app.resize.isPortrait);
		
		this.cars.once('pointerdown', () => {
			this.step = 0;
			this.moveCar(this.cars.children[0]);
			this.clearInactivityTimer();
			app.sound.play('truck', { loop: false });
		});
		
		this.cowBtn.on('pointerdown', () => {
			this.upgradeCowCount = true;
			this.cowBtn.clicked = true;
			this.upgradeCow();
			this.clearInactivityTimer();
			this.stopTutorHand();
			
			app.sound.play('cow', { loop: false });
		});
		
		this.truckBtn.on('pointerdown', () => {
			this.truckBtn.clicked = true;
			this.upgradeCar();
			this.clearInactivityTimer();
			this.stopTutorHand();
			this.upgradeCowCount = false;
			
			app.sound.play('upgrade', { loop: false });
		});
		
		this.startGame();
	};
	
	startInactivityTimer = () => {
		this.clearInactivityTimer();
		this.inactivityTimeout = setTimeout(() => {
			this.decreaseHealth();
			this.startInactivityTimer();
		}, this.inactivityLimit);
	};
	
	clearInactivityTimer = () => {
		if (this.inactivityTimeout) {
			clearTimeout(this.inactivityTimeout);
			this.inactivityTimeout = null;
		}
	};
	
	showPackshot = (finish = false) => {
		this.stopTutorHand();
		this.clearInactivityTimer();
		
		if (finish) this.packshot.children[1].visible = false;
		
		this.packshot.visible = true;
		gsap.to(this.packshot.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: 'power2.in',
			onComplete: () => this.tutorHand.visible = false
		});
	};
	
	decreaseHealth = () => {
		const healthCount = this.statusHealth.children.filter(child => child.visible).length;
		if (!healthCount) {
			this.clearInactivityTimer();
			this.showPackshot();
			app.sound.stop('fail');
			return;
		}
		
		const health = this.statusHealth.children.find(child => child.visible);
		gsap.to(health, {
			x: '+=5',
			rotation: 0.05,
			duration: 0.05,
			yoyo: true,
			repeat: 30,
			ease: 'sine.inOut',
			onComplete: () => {
				health.visible = false;
				app.sound.play('fail', { loop: false, volume: 0.3 });
				
				if (healthCount === 1) this.showPackshot();
			}
		});
	};
	
	moveCameraTo(x, y, duration = 2) {
		console.log(this.step, 'moveCameraTo');
		return gsap.to(this.world, {
			x: -x,
			y: -y,
			ease: 'power2.inOut',
			duration
		});
	};
	
	moveCameraToPositionByStep = (duration = 2) => {
		let tween = null;
		
		if (this.moveFront) {
			if (this.step === 0) {
				if (app.resize.isPortrait) {
					tween = this.moveCameraTo(
						this.background.display.x,
						this.background.display.y,
						duration);
				} else {
					tween = this.moveCameraTo(0, this.background.display.y / 2, duration);
				}
			}
			
			if (this.step === 1) {
				if (app.resize.isPortrait) {
					tween = this.moveCameraTo(
						400,
						-this.background.display.height / 12,
						duration
					);
				} else {
					tween = this.moveCameraTo(this.background.display.x, this.background.display.y, duration);
				}
			}
			
			if (this.step === 2) {
				if (app.resize.isPortrait) {
					tween = this.moveCameraTo(
						400,
						this.background.display.y,
						duration
					);
				} else {
					tween = this.moveCameraTo(this.background.display.x, this.background.display.y, duration);
				}
			}
		} else {
			if (this.step === 0) {
				if (app.resize.isPortrait) {
					tween = this.moveCameraTo(
						this.background.display.width - this.app.width * 1.5,
						this.background.display.y,
						duration
					);
				} else {
					tween = this.moveCameraTo(
						0,
						this.background.display.y,
						duration
					);
				}
			}
			
			if (this.step === 1) {
				if (app.resize.isPortrait) {
					tween = this.moveCameraTo(0, 0, duration);
				} else {
					tween = this.moveCameraTo(0, -250, duration);
				}
			}
			
			if (this.step === 2 || this.step === 3 || this.step === 4) {
				if (app.resize.isPortrait) {
					tween = this.moveCameraTo(0, 0, duration);
				} else {
					tween = this.moveCameraTo(0, -50, duration);
				}
			}
		}
		
		return tween;
	};
	
	getStage = () => this.gameStage;
	
	startGame = () => {
		if (this.sceneStart.visible) {
			this.animateTutorHand();
		} else {
			this.tutorHand.visible = false;
		}
		
		this.gameStage = gameStages.stageOne;
		
		this.sceneStart.on('pointerdown', () => {
			this.hideSceneStart();
			this.tutorHand.visible = false;
			this.startInactivityTimer();
		});
	};
	
	hideSceneStart() {
		gsap.to(this.sceneStart.scale, {
			x: 0,
			y: 0,
			duration: 0.5,
			ease: 'power2.in',
			onComplete: () => {
				this.sceneStart.visible = false;
				this.tutorHand.visible = false;
				this.animateTutorHand(this.cars);
			}
		});
	}
	
	animateTutorHand(...targets) {
		this.stopTutorHand();
		if (!targets.length) {
			this.tutorHand.visible = true;
			gsap.to(this.tutorHand.scale, {
				x: 1.2, y: 1.2,
				duration: 0.5,
				yoyo: true,
				repeat: -1,
				ease: 'sine.inOut'
			});
			return;
		}
		
		this.targets = targets.flat();
		if (!this.targets.length) return;
		
		this._tutorActive = true;
		let index = 0;
		
		const animateNext = () => {
			if (!this._tutorActive) return;
			
			const activeTargets = this.targets.filter(t => !t.clicked);
			if (!activeTargets.length) {
				this.stopTutorHand();
				return;
			}
			
			const target = activeTargets[index % activeTargets.length];
			if (!target) return;
			
			const globalPos = target.getGlobalPosition();
			const localPos = this.tutorHand.parent.toLocal(globalPos);
			
			gsap.killTweensOf(this.tutorHand);
			this.tutorHand.scale.set(1, 1);
			
			gsap.to(this.tutorHand.position, {
				x: localPos.x,
				y: localPos.y,
				duration: 0.5,
				ease: 'power1.inOut',
				onComplete: () => {
					if (!this._tutorActive) return;
					const repeatCount = activeTargets.length === 1 ? -1 : 1;
					this.tutorHand.visible = true;
					
					gsap.to(this.tutorHand.scale, {
						x: 1.2,
						y: 1.2,
						duration: 0.5,
						yoyo: true,
						repeat: repeatCount,
						ease: 'sine.inOut',
						onComplete: () => {
							if (!this._tutorActive) return;
							if (activeTargets.length > 1) {
								index++;
								animateNext();
							}
						}
					});
				}
			});
		};
		
		animateNext();
	}
	
	stopTutorHand() {
		this._tutorActive = false;
		this.tutorHand.visible = false;
		gsap.killTweensOf(this.tutorHand);
		gsap.killTweensOf(this.tutorHand.scale);
		this.tutorHand.scale.set(1, 1);
		this.targets = [];
	};
	
	moveCar(car) {
		this.cowBtn.clicked = false;
		this.truckBtn.clicked = false;
		this.stopTutorHand();
		
		const path = [
			{ x: -310, y: -190, spriteIndex: 2 },
			{ x: 380, y: -210, spriteIndex: 4 },
			{ x: 105, y: 50, spriteIndex: 6 }
		];
		
		const moveNext = () => {
			if (this.step >= path.length) {
				this.addEventToCows(car);
				this.clearInactivityTimer();
				return;
			}
			
			const move = path[this.step];
			gsap.to(car, {
				x: car.x + move.x,
				y: car.y + move.y,
				duration: Math.hypot(move.x, move.y) / this.speedCar,
				ease: 'linear',
				onStart: () => {
					this.switchSprite(car, move.spriteIndex);
					const tween = this.moveCameraToPositionByStep();
					tween.eventCallback('onComplete', () => this.animateTutorHand(car));
					
					if (this.step === 2) {
						tween.eventCallback('onComplete', () => {
							app.sound.stop('truck');
							this.addEventToCows(car);
							this.moveFront = false;
						});
					}
				},
				onComplete: () => {
					if (this.step < path.length - 1) {
						car.clicked = false;
						car.eventMode = 'static';
						car.cursor = 'pointer';
						this.startInactivityTimer();
						app.sound.stop('truck');
						
						car.once('pointerdown', () => {
							this.clearInactivityTimer();
							this.step++;
							car.clicked = true;
							this.stopTutorHand();
							moveNext();
							app.sound.play('truck', { loop: false });
						});
					}
					
					if (this.step === path.length - 1) this.boilMilk();
				}
			});
		};
		
		moveNext();
	}
	
	moveCarBack(car, milk) {
		const path = [
			{ x: 105, y: 50, spriteIndex: 3 },
			{ x: 380, y: -210, spriteIndex: 1 },
			{ x: -310, y: -190, spriteIndex: 7 },
			{ x: -4, y: -4, spriteIndex: 1 }
		];
		
		const moveNext = () => {
			if (this.step >= path.length) {
				car.clicked = false;
				this.stopTutorHand();
				
				car.eventMode = 'static';
				car.cursor = 'pointer';
				this.clearInactivityTimer();
				this.startInactivityTimer();
				
				const milkCounts = {
					stageOne: 2,
					stageTwo: 3,
					stageThree: 4,
					stageFour: 5
				};
				const stage = this.getStage();
				const count = milkCounts[stage] ?? 2;
				app.sound.stop('truck');
				
				car.once('pointerdown', () => {
					this.dropMilk(car, count);
				});
				return;
			}
			
			const move = path[this.step];
			gsap.to(car, {
				x: car.x - move.x,
				y: car.y - move.y,
				duration: Math.hypot(move.x, move.y) / this.speedCar,
				ease: 'linear',
				onStart: () => {
					this.switchSprite(car, move.spriteIndex);
					const tween = this.moveCameraToPositionByStep();
					if (this.step !== path.length - 1) {
						tween.eventCallback('onComplete', () => this.animateTutorHand(car));
					}
					
					if (this.step === path.length - 1) {
						milk.visible = true;
						this.hideBoilMilk();
					}
				},
				onComplete: () => {
					if (this.step < path.length - 2) {
						car.clicked = false;
						car.eventMode = 'static';
						car.cursor = 'pointer';
						this.startInactivityTimer();
						
						app.sound.stop('truck');
						
						car.once('pointerdown', () => {
							this.clearInactivityTimer();
							this.step++;
							this.stopTutorHand();
							moveNext();
							car.clicked = true;
							this.stopTutorHand();
							
							app.sound.play('truck', { loop: false });
						});
					} else {
						this.step++;
						moveNext();
					}
				}
			});
		};
		
		moveNext();
	}
	
	switchSprite(car, showIndex) {
		car.children.forEach((child, i) => {
			if (i === showIndex) {
				child.visible = true;
				child.alpha = 0;
				gsap.to(child, { alpha: 1, duration: 0.1 });
			} else {
				if (child.visible) {
					gsap.to(child, {
						alpha: 0,
						duration: 0.1,
						onComplete: () => (child.visible = false)
					});
				}
			}
		});
	};
	
	filterCows = () => {
		return this.cows.filter(child => child.children[1]?.visible);
	};
	
	addEventToCows = (car) => {
		this.stopTutorHand();
		this.startInactivityTimer();
		const cows = this.filterCows();
		this.animateTutorHand(cows);
		
		let cowClicked = false;
		
		cows.forEach(cow => {
			cow.once('pointerdown', (event) => {
				this.step = 0;
				
				if (cowClicked) return;
				cowClicked = true;
				this.stopTutorHand();
				
				cow.clicked = true;
				this.clearInactivityTimer();
				this.startInactivityTimer();
				const clickedCow = event.currentTarget;
				this.collectMilk(car, clickedCow);
				this.stopTutorHand();
				cow.clicked = false;
			});
		});
	};
	
	collectMilk = (car, cow) => {
		app.sound.play('cowMilking', { loop: false });
		const indexVisibleCar = car.children.findIndex(child => child.visible);
		
		const carMilk = car.children[indexVisibleCar + 1];
		const carEmpty = car.children[indexVisibleCar];
		carMilk.visible = true;
		carMilk.alpha = 0;
		
		const milk = cow.children[2];
		
		const timeline = gsap.timeline();
		
		gsap.to(carMilk, {
			alpha: 1,
			duration: 1.5,
			ease: 'power1.inOut'
		});
		
		timeline.to(carEmpty, {
			x: '+=5',
			rotation: 0.05,
			duration: 0.05,
			yoyo: true,
			repeat: 30,
			ease: 'sine.inOut',
			onComplete: () => {
				carEmpty.visible = false;
				carEmpty.x = 0;
				carEmpty.rotation = 0;
				this.stopTutorHand();
				this.animateTutorHand(carMilk);
				
				app.sound.stop('cowMilking');
			}
		}, 0);
		
		timeline.to(milk.scale, {
			x: 0,
			y: 0,
			duration: 0.5,
			ease: 'power1.inOut',
			onComplete: () => {
				milk.visible = false;
				this.cars.once('pointerdown', () => {
					car.clicked = true;
					this.moveCarBack(car, milk);
					this.stopTutorHand();
					app.sound.play('truck', { loop: false });
				});
			}
		}, 0);
	};
	
	dropMilk = (car, count = 2) => {
		this.step = 0;
		this.moveFront = true;
		
		this.clearInactivityTimer();
		this.stopTutorHand();
		this.milk.visible = true;
		
		const startPos = { x: this.milk.x, y: this.milk.y };
		const getFirstCustomer = () => {
			let first = this.customers.display.children[0];
			this.customers.display.children.forEach(c => {
				if (c.y < first.y) first = c; // если очередь вертикальная
				// если горизонтальная — сравнивай по c.x
			});
			return first;
		};
		
		const firstCustomer = getFirstCustomer();
		const globalPos = firstCustomer.getGlobalPosition();
		const localPos = this.milk.parent.toLocal(globalPos);
		
		const timeline = gsap.timeline({
			repeat: count - 1,
			onRepeat: () => {
				this.milk.position.set(startPos.x, startPos.y);
			}
		});
		timeline.to(this.milk.position, {
			x: localPos.x,
			y: localPos.y,
			duration: 0.8,
			ease: 'power1.inOut',
			onComplete: () => {
				const lastIndex = this.customers.display.children.length - 1;
				this.replaceCustomers(lastIndex);
				
				const stageConfig = {
					[gameStages.stageOne]: { base: 10, upgraded: 10, max: 20 },
					[gameStages.stageTwo]: { base: 34, upgraded: 20, max: 100 },
					[gameStages.stageThree]: { base: 50, upgraded: 25, max: 200 },
					[gameStages.stageFour]: { base: 60, upgraded: 60, max: 300 }
				};
				
				const stage = this.getStage();
				const cfg = stageConfig[stage];
				
				if (cfg) {
					const increment = this.upgradeCowCount ? cfg.upgraded : cfg.base;
					this.currentProgress += increment;
					this.statusBar.updateProgress(this.currentProgress, cfg.max);
				}
			}
		});
		
		timeline.eventCallback('onComplete', () => {
			this.milk.position.set(startPos.x, startPos.y);
			this.milk.visible = false;
			car.children[0].visible = true;
			car.children[0].alpha = 1;
			car.children[1].visible = false;
			
			app.sound.stop('cowMilking');
			
			const stageFlow = [
				{
					stage: gameStages.stageOne,
					cows: 1,
					nextStage: gameStages.stageTwo,
					actions: []
				},
				{
					stage: gameStages.stageTwo,
					cows: 1,
					nextStage: gameStages.stageThree,
					actions: []
				},
				{
					stage: gameStages.stageTwo,
					cows: 2,
					nextStage: gameStages.stageThree,
					actions: [
						() => this.decreaseHealth(),
						() => this.showFail(),
						() => {
							const cow = this.filterCows()[0];
							cow?.children?.[1] && (cow.children[1].visible = false);
							cow?.children?.[2] && (cow.children[2].visible = false);
						}
					]
				},
				{
					stage: gameStages.stageThree,
					cows: 1,
					nextStage: gameStages.stageFour,
					actions: []
				},
				{
					stage: gameStages.stageThree,
					cows: 2,
					nextStage: gameStages.stageFour,
					actions: [
						() => this.decreaseHealth(),
						() => this.showFail(),
						() => {
							const cow = this.filterCows()[0];
							cow?.children?.[1] && (cow.children[1].visible = false);
							cow?.children?.[2] && (cow.children[2].visible = false);
						}
					]
				},
				{
					stage: gameStages.stageFour,
					cows: null,
					nextStage: gameStages.stageFinish,
					actions: [
						() => this.showPackshot(true)
					]
				}
			];
			
			const currentStage = this.getStage();
			const cowsCount = this.filterCows().length;
			
			const flow = stageFlow.find(item =>
				item.stage === currentStage && (item.cows === null || item.cows === cowsCount)
			);
			
			if (flow) {
				flow.actions.forEach(fn => fn());
				this.gameStage = flow.nextStage;
			}
			
			if (currentStage !== gameStages.stageStart && currentStage !== gameStages.stageFour && cowsCount === 1) {
				this.showButtonsUpgrade();
			}
		});
	};
	
	replaceCustomers = (lastIndex) => {
		const firstPos = {
			x: this.customers.display.children[0].x,
			y: this.customers.display.children[0].y
		};
		
		for (let i = 0; i < lastIndex; i++) {
			const current = this.customers.display.children[i];
			const next = this.customers.display.children[i + 1];
			
			gsap.to(current, {
				x: next.x,
				y: next.y,
				duration: 0.4,
				ease: 'power2.inOut',
				delay: i * 0.05
			});
		}
		
		const last = this.customers.display.children[lastIndex];
		last.visible = false;
		gsap.to(last, {
			x: firstPos.x,
			y: firstPos.y,
			duration: 0.4,
			ease: 'power2.inOut',
			onComplete: () => {
				last.visible = true;
				
				let firstCustomer = this.customers.display.children[0];
				this.customers.display.children.forEach(c => {
					if (c.y < firstCustomer.y) {
						firstCustomer = c;
					}
				});
				
				this.customers.display.children.forEach(c => {
					if (c.children[1]) {
						c.children[1].visible = (c === firstCustomer);
					}
				});
			}
		});
	};
	
	showButtonsUpgrade = () => {
		this.cowBtn.visible = true;
		this.truckBtn.visible = true;
		this.cowBtn.scale.set(0, 0);
		this.truckBtn.scale.set(0, 0);
		
		this.startInactivityTimer();
		
		const tl = gsap.timeline();
		
		tl.to(this.cowBtn.scale, { x: 1, y: 1, duration: 0.5, ease: 'power2.in' }, 0)
			.to(this.truckBtn.scale, { x: 1, y: 1, duration: 0.5, ease: 'power2.in' }, 0);
		
		tl.add(() => {
			this.sceneStart.visible = false;
			this.tutorHand.visible = false;
			this.animateTutorHand(this.truckBtn, this.cowBtn);
		});
	};
	
	upgradeCow = () => {
		this.truckBtn.visible = false;
		this.cowBtn.visible = false;
		this.upgradeCowCount = true;
		this.stopTutorHand();
		
		this.cows[1].children[1].visible = true;
		this.cows[1].children[2].visible = true;
		
		const currentIndexCar = this.cars.children.findIndex(child => child.visible);
		const car = this.cars.children[currentIndexCar];
		this.animateTutorHand(car);
		
		if (this.getStage() === gameStages.stageTwo) {
			this.currentProgress = 0;
			this.statusBar.updateProgress(this.currentProgress, 100);
			
			
			this.cars.once('pointerdown', () => {
				this.moveCar(car);
				this.clearInactivityTimer();
				app.sound.play('truck', { loop: false });
			});
			return;
		}
		
		if (this.getStage() === gameStages.stageThree) {
			this.currentProgress = 0;
			this.statusBar.updateProgress(this.currentProgress, 200);
			
			this.cars.once('pointerdown', () => {
				this.moveCar(car);
				this.clearInactivityTimer();
				app.sound.play('truck', { loop: false });
			});
			return;
		}
		
		if (this.getStage() === gameStages.stageFour) {
			this.currentProgress = 0;
			this.statusBar.updateProgress(this.currentProgress, 300);
			
			this.cars.once('pointerdown', () => {
				this.moveCar(car);
				this.clearInactivityTimer();
				app.sound.play('truck', { loop: false });
			});
		}
	};
	
	upgradeCar = () => {
		this.truckBtn.visible = false;
		this.cowBtn.visible = false;
		
		this.animateTutorHand(this.cars);
		
		const currentIndexCar = this.cars.children.findIndex(child => child.visible);
		const nextIndexCar = currentIndexCar + 1;
		const nextCar = this.cars.children[nextIndexCar];
		
		if (!nextCar) {
			console.warn('Следующей машины нет для апгрейда');
			return;
		}
		
		if (this.getStage() === gameStages.stageTwo) {
			this.currentProgress = 0;
			this.statusBar.updateProgress(this.currentProgress, 100);
		} else if (this.getStage() === gameStages.stageThree) {
			this.currentProgress = 0;
			this.statusBar.updateProgress(this.currentProgress, 200);
		} else if (this.getStage() === gameStages.stageFour) {
			this.currentProgress = 0;
			this.statusBar.updateProgress(this.currentProgress, 300);
		}
		
		this.cars.children[currentIndexCar].visible = false;
		nextCar.scale.set(0);
		nextCar.visible = true;
		
		gsap.to(nextCar.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: 'power2.in',
			onComplete: () => {
				this.cars.once('pointerdown', () => {
					this.moveCar(nextCar);
					this.clearInactivityTimer();
					app.sound.play('truck', { loop: false });
				});
			}
		});
	};
	
	showFail = () => {
		this.fail.visible = true;
		
		gsap.to(this.fail.scale, {
			x: 1,
			y: 1,
			duration: 0.5,
			ease: 'power2.in',
			onComplete: () => {
				this.stopTutorHand();
				setTimeout(() => {
					this.fail.visible = false;
					this.showButtonsUpgrade();
				}, 1500);
			}
		});
	};
	
	boilMilk = () => {
		const cows = this.filterCows();
		
		cows.forEach(cow => {
			const milkContainer = cow.children[2];
			
			milkContainer.children.forEach((sprite, index) => {
				sprite.visible = true;
				sprite.alpha = index === 0 || index === 1 ? 1 : 0;
			});
			
			gsap.to(milkContainer.children.slice(2), {
				alpha: 1,
				duration: 1,
				stagger: 0.4,
			});
		});
	};
	
	hideBoilMilk = () => {
		const cows = this.filterCows();
		
		cows.forEach(cow => {
			const milkContainer = cow.children[2];
			milkContainer.children.forEach((sprite, index) => {
				sprite.visible = true;
				sprite.alpha = index === 0 || index === 1 ? 1 : 0;
			});
		});
	};
}
