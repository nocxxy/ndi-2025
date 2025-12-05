/**
 * @fileoverview Decathlon Sport App - Alpine.js component
 * @description A QCM-based app to generate personalized workout programs.
 *              Ported from vanilla JS to Alpine.js for the NDI OS.
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('sportApp', () => ({
		// State
		currentScreen: 'welcome-screen',
		currentQuestionIndex: 0,
		userProfile: {},
		
		// Constants (Data)
		questions: [
			{
				id: 1,
				question: "Quel est votre niveau sportif actuel ?",
				options: [
					{ value: "debutant", label: "Débutant - Je commence tout juste", icon: "🌱" },
					{ value: "intermediaire", label: "Intermédiaire - Je pratique régulièrement", icon: "💪" },
					{ value: "avance", label: "Avancé - Je suis très actif", icon: "🔥" },
				],
			},
			{
				id: 2,
				question: "Quel type d'exercice préférez-vous ?",
				options: [
					{ value: "cardio", label: "Cardio - Course, HIIT", icon: "🏃" },
					{ value: "renforcement", label: "Renforcement musculaire", icon: "💪" },
					{ value: "souplesse", label: "Souplesse - Yoga, étirements", icon: "🧘" },
					{ value: "mixte", label: "Un peu de tout", icon: "🎯" },
				],
			},
			{
				id: 3,
				question: "Quel est votre objectif principal ?",
				options: [
					{ value: "forme", label: "Garder la forme", icon: "✨" },
					{ value: "energie", label: "Boost d'énergie", icon: "⚡" },
					{ value: "stress", label: "Réduire le stress", icon: "😌" },
					{ value: "force", label: "Gagner en force", icon: "🏋️" },
				],
			},
			{
				id: 4,
				question: "De combien de temps disposez-vous ?",
				options: [
					{ value: "15min", label: "15 minutes", icon: "⏱️" },
					{ value: "20min", label: "20 minutes", icon: "⏰" },
					{ value: "30min", label: "30 minutes", icon: "🕐" },
				],
			},
			{
				id: 5,
				question: "Avez-vous du matériel ?",
				options: [
					{ value: "aucun", label: "Aucun matériel", icon: "🚫" },
					{ value: "basique", label: "Tapis de sol", icon: "📋" },
					{ value: "complet", label: "Haltères, bandes élastiques", icon: "🎽" },
				],
			},
		],

		exercisesDatabase: {
			debutant_cardio: {
				name: "HIIT Débutant",
				duration: "15 min",
				image: "🏃‍♂️",
				instructions: [
					"Échauffement : 3 min de marche sur place en montant progressivement les genoux",
					"Jumping Jacks : 30 sec (sautez en écartant bras et jambes) - Repos 30 sec",
					"Montées de genoux : 30 sec (alternez chaque genou vers la poitrine) - Repos 30 sec",
					"Squats : 30 sec (descendez comme pour vous asseoir, genoux alignés aux chevilles) - Repos 30 sec",
					"Répétez ce circuit 3 fois",
					"Retour au calme : 2 min d'étirements légers",
				],
				tips: "💡 Gardez le dos droit pendant tous les exercices et respirez régulièrement",
				visual: "📊 Rythme : 30 sec effort / 30 sec repos",
			},
			intermediaire_renforcement: {
				name: "Renforcement Complet",
				duration: "20 min",
				image: "💪",
				instructions: [
					"Échauffement : 3 min de rotation des articulations (épaules, hanches, genoux)",
					"Pompes : 3 séries de 10-15 répétitions (sur les genoux si nécessaire)",
					"Squats : 3 séries de 15 répétitions (descendez jusqu'à 90°, poids sur les talons)",
					"Planche : 3 fois 30-45 sec (alignez épaules-hanches-chevilles, contractez les abdos)",
					"Fentes alternées : 3 séries de 10 par jambe (genou avant à 90°, ne touchez pas le sol)",
					"Mountain climbers : 3 séries de 20 sec (en position pompe, ramenez les genoux alternativement)",
					"Étirements : 3 min (tous les groupes musculaires travaillés)",
				],
				tips: "💡 Repos de 45 sec entre chaque série. Hydratez-vous régulièrement",
				visual: "📊 Structure : 3 séries par exercice avec 45 sec de repos",
			},
			avance_mixte: {
				name: "Circuit Intensif",
				duration: "30 min",
				image: "🔥",
				instructions: [
					"Échauffement dynamique : 5 min (jumping jacks, montées de genoux, rotations)",
					"Circuit à répéter 4 fois :",
					"  - Burpees : 15 répétitions (squat → planche → pompe → saut)",
					"  - Squats sautés : 20 répétitions (explosivité vers le haut)",
					"  - Pompes diamant : 15 répétitions (mains rapprochées sous la poitrine)",
					"  - Mountain climbers : 30 sec à intensité maximale",
					"  - Planche latérale : 30 sec par côté (corps aligné, bassin haut)",
					"  - Repos : 60 sec entre chaque circuit",
					"Retour au calme : 5 min d'étirements profonds et respiration",
				],
				tips: "💡 Maintenez une intensité élevée. Buvez de l'eau entre les circuits",
				visual: "📊 Format : 4 circuits complets avec 60 sec de repos",
			},
			debutant_souplesse: {
				name: "Yoga Doux & Étirements",
				duration: "20 min",
				image: "🧘",
				instructions: [
					"Position de l'enfant : 2 min (à genoux, front au sol, bras devant)",
					"Chat-vache : 10 répétitions (alternez dos rond et dos creusé à 4 pattes)",
					"Chien tête en bas : 1 min (en V inversé, talons vers le sol, dos long)",
					"Fente basse : 1 min par côté (genou arrière au sol, étirez la hanche avant)",
					"Torsion assise : 1 min par côté (jambes croisées, rotation du buste)",
					"Papillon : 2 min (assis, plantes des pieds jointes, penchez-vous en avant)",
					"Pigeon : 2 min par côté (jambe avant pliée, jambe arrière tendue, penchez-vous en avant)",
					"Savasana : 3 min (allongé sur le dos, totalement relâché)",
				],
				tips: "💡 Respirez profondément dans chaque posture. N'allez jamais jusqu'à la douleur",
				visual: "📊 Respiration : Inspirez profondément, expirez en vous étirant davantage",
			},
		},

		productsDatabase: {
			cardio: [
				{
					id: "cardio_1",
					name: "Corde à Sauter Fitness",
					price: "9.99€",
					image: "https://contents.mediadecathlon.com/p2568401/k$095d4e977e83998ef2ffcaf50953b94b/sq/corde-a-sauter-avec-poignees-en-gomme-longueur-ajustable-3m-bleu-fonce.jpg?format=auto&f=969x969",
					description: "Corde réglable, poignées ergonomiques",
					link: "https://www.decathlon.fr/p/corde-a-sauter-500-gomme/_/R-p-309793?mc=8828273&c=bleu",
				},
				{
					id: "cardio_2",
					name: "Tapis de Course Pliable",
					price: "299€",
					image: "https://contents.mediadecathlon.com/m23519055/k$6f06d3e212a0b7486e44790eb6296ab7/sq/tapis-de-course-pliable-1400wcitysports-wp9appbluetoothvitesse-1-12kmh.jpg?format=auto&f=969x969",
					description: "Moteur 1.5 HP, vitesse max 10 km/h",
					link: "https://www.decathlon.fr/p/mp/citysports/tapis-de-course-pliable-1400w-citysports-wp9-app-bluetooth-vitesse-1-12km-h/_/R-p-db56b0a1-8c19-45b8-823c-6d6d630484dd?mc=db56b0a1-8c19-45b8-823c-6d6d630484dd_c1&c=noir",
				},
				{
					id: "cardio_3",
					name: "Chronomètre ONSTART 110 noir",
					price: "9.99€",
					image: "https://contents.mediadecathlon.com/p1524418/k$0872fba34f6d06a8597c4274cb89d102/sq/chronometre-onstart-110-noir.jpg?format=auto&f=969x969",
					description: "Programmation intervalles personnalisés",
					link: "https://www.decathlon.fr/p/chronometre-onstart-110-noir/_/R-p-104728?mc=8548015",
				},
			],
			renforcement: [
				{
					id: "renfo_1",
					name: "Set Haltères Ajustables 2-20kg",
					price: "143,99€",
					image: "https://contents.mediadecathlon.com/m23886616/k$0e2a48d48dc3745b100329ee36c27864/sq/haltere-ajustable-unique-set-dhaltere-de-20-kg-9-halteres-en-un.jpg?format=auto&f=969x969",
					description: "6 poids différents, gain de place",
					link: "https://www.decathlon.fr/p/mp/tunturi/haltere-ajustable-unique-set-d-haltere-de-20-kg-9-halteres-en-un/_/R-p-58ffbe64-d2f7-417b-8280-4aae05c5617a?mc=58ffbe64-d2f7-417b-8280-4aae05c5617a_c1",
				},
				{
					id: "renfo_2",
					name: "Bandes de Résistance (Lot de 5)",
					price: "23,95€",
					image: "https://contents.mediadecathlon.com/m24456283/k$f0b30a767f218d05b97d6bcd7d9cc29e/sq/set-5-bandes-de-resistance-anti-glissant-de-fitness-pour-yoga-pilates-stretching.jpg?format=auto&f=969x969",
					description: "5 niveaux de résistance, avec ancrage porte",
					link: "https://www.decathlon.fr/p/mp/mobiclinic/set-5-bandes-de-resistance-anti-glissant-de-fitness-pour-yoga-pilates-stretching/_/R-p-bc52ee29-dd47-49b6-b628-72214196ea72?mc=bc52ee29-dd47-49b6-b628-72214196ea72_c1",
				},
				{
					id: "renfo_3",
					name: "Tapis de Fitness Épais 15mm",
					price: "34.99€",
					image: "https://contents.mediadecathlon.com/m23369413/k$2e80fe23eea9e073e5d1fce305342278/sq/tapis-de-fitness-tapis-de-sport-extra-epais-protecteur-pour-les-articulations.jpg?format=auto&f=969x969",
					description: "Confort optimal, antidérapant",
					link: "https://www.decathlon.fr/p/mp/neolymp/tapis-de-fitness-tapis-de-sport-extra-epais-protecteur-pour-les-articulations/_/R-p-d044482d-faa6-4e05-adc6-009a55d7b267?mc=d044482d-faa6-4e05-adc6-009a55d7b267_c60",
				},
			],
			souplesse: [
				{
					id: "souplesse_1",
					name: "Tapis de Yoga Premium 5mm",
					price: "45€",
					image: "https://contents.mediadecathlon.com/m22520546/k$173103afd84c24670705f273f0c7970f/sq/tapis-de-yoga-premium-5mm-trace-blue.jpg?format=auto&f=969x969",
					description: "Écologique, antidérapant, avec sac de transport",
					link: "https://www.decathlon.fr/p/mp/adidas/tapis-de-yoga-premium-5mm-trace-blue/_/R-p-478a8d75-cf10-4ad0-96dd-0557021b2cb7?mc=478a8d75-cf10-4ad0-96dd-0557021b2cb7_novar",
				},
				{
					id: "souplesse_2",
					name: "Briques de Yoga en Liège (x2)",
					price: "36.99€",
					image: "https://contents.mediadecathlon.com/m18952104/k$18a91e6c26a5c52977d7963515a71ad6/sq/2-blocs-de-yoga-en-liege-taille-moyenne-et-coins-arrondis-lune.jpg?format=auto&f=969x969",
					description: "100% liège naturel, légères et stables",
					link: "https://www.decathlon.fr/p/mp/divasya/2-blocs-de-yoga-en-liege-taille-moyenne-et-coins-arrondis-mandala/_/R-p-106e4c99-e4cf-45ba-9e4a-198e9a058ce9?mc=106e4c99-e4cf-45ba-9e4a-198e9a058ce9_c27c27&c=marron",
				},
				{
					id: "souplesse_3",
					name: "Sangle d'Étirement Yoga",
					price: "12.99€",
					image: "https://contents.mediadecathlon.com/m22624899/k$5d02f2921a28a664375c15faaa6d9885/sq/sangle-de-yoga-100-coton-sangle-pour-etirements-yoga-plusieurs-couleurs-a.jpg?format=auto&f=969x969",
					description: "Coton résistant, 10 boucles de réglage",
					link: "https://www.decathlon.fr/p/mp/gorilla-sports/sangle-de-yoga-100percent-coton-sangle-pour-etirements-yoga-plusieurs-couleurs-a/_/R-p-be3a0cb5-765a-488e-b442-89503d199961?mc=be3a0cb5-765a-488e-b442-89503d199961_c26c24&c=rose",
				},
			],
			mixte: [
				{
					id: "mixte_1",
					name: "Kit Fitness Complet 8 pièces",
					price: "63,99€",
					image: "https://contents.mediadecathlon.com/m25838596/k$9a3484e582b44fcf95464ce6fc3430a0/sq/sangle-dentrainement-reglable-avec-ancrage-set-fitness-complet-maison.jpg?format=auto&f=969x969",
					description: "Haltères, bandes, tapis, corde à sauter",
					link: "https://www.decathlon.fr/p/mp/neolymp/sangle-d-entrainement-reglable-avec-ancrage-set-fitness-complet-maison/_/R-p-a18e341e-a5ac-4eb4-9bef-f8e3733ca5a5?mc=a18e341e-a5ac-4eb4-9bef-f8e3733ca5a5_c1",
				},
				{
					id: "mixte_2",
					name: "Tapis Multi-Usages Training 10mm",
					price: "29.99€",
					image: "https://contents.mediadecathlon.com/p2939972/k$cda64a01f90d3049a00753813ade3412/sq/tapis-fitness-900-resistant-170cm-x-58cm-x-10mm-noir.jpg?format=auto&f=969x969",
					description: "Yoga, fitness, stretching - Ultra polyvalent",
					link: "https://www.decathlon.fr/p/tapis-de-fitness-resistant-epaisseur-10-mm-gris-clair/_/R-p-345057?mc=8788600&c=gris",
				},
				{
					id: "mixte_3",
					name: "Roue Abdominale + Tapis Genoux",
					price: "19.99€",
					image: "https://contents.mediadecathlon.com/m26058506/k$21b3fe95068238e3d310e84fcac35870/sq/roue-abdominale-avec-tapis-genoux-pour-entrainement-a-domicile.jpg?format=auto&f=1800x1800",
					description: "Renforcement core, poignées antidérapantes",
					link: "https://www.decathlon.fr/p/mp/tunturi/roue-abdominale-avec-tapis-genoux-pour-entrainement-a-domicile/_/R-p-833e7a03-e350-422e-a412-db10296cce67?mc=833e7a03-e350-422e-a412-db10296cce67_c1c1c1",
				},
			],
		},

		init() {
			if (window.emit) emit('app:opened', { appId: 'sport' });
		},

		// Computeds via getters for Alpine 3 or functions
		get currentQuestion() {
			return this.questions[this.currentQuestionIndex];
		},

		get progressPercent() {
			return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100);
		},

		get resultExercise() {
			const key = `${this.userProfile.niveau}_${this.userProfile.type}`;
			return this.exercisesDatabase[key] || this.exercisesDatabase["intermediaire_renforcement"];
		},

		get resultProducts() {
			return this.productsDatabase[this.userProfile.type] || this.productsDatabase["mixte"];
		},

		// Actions
		startQCM() {
			this.currentScreen = 'qcm-screen';
			this.currentQuestionIndex = 0;
		},

		selectAnswer(questionId, value) {
			// Map question ID to profile key (simplified logic)
			const keyMap = { 1: 'niveau', 2: 'type', 3: 'objectif', 4: 'temps', 5: 'materiel' };
			const key = keyMap[questionId];
			if (key) {
				this.userProfile[key] = value;
			}

			if (this.currentQuestionIndex < this.questions.length - 1) {
				this.currentQuestionIndex++;
			} else {
				this.showResults();
			}
		},

		showResults() {
			this.currentScreen = 'results-screen';
		},

		restart() {
			this.userProfile = {};
			this.currentQuestionIndex = 0;
			this.currentScreen = 'welcome-screen';
		}
	}));
});
