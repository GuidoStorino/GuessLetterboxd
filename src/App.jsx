import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════
//  SHARED DATA & HELPERS
// ════════════════════════════════════════════════════════════

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function getDayIndex() {
  const epoch = new Date(2024, 0, 1);
  return Math.floor((new Date() - epoch) / 86400000);
}
function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}
function getTimeUntilMidnight() {
  const now = new Date(), mid = new Date(now);
  mid.setHours(24,0,0,0);
  const d = mid - now;
  return { h:Math.floor(d/3600000), m:Math.floor((d%3600000)/60000), s:Math.floor((d%60000)/1000) };
}
const pad = n => String(n).padStart(2,"0");

// ════════════════════════════════════════════════════════════
//  MOVIES DATA
// ════════════════════════════════════════════════════════════
const MOVIES = [
  { id:1, title:"Parasite", year:2019, director:"Bong Joon-ho", stars:"★★★★★", reviews:[
    {rank:3,author:"davidehrlich",text:"The best film of the decade is also the funniest, the scariest, and the most heartbreaking. A movie that can't be described without ruining it, and can't be ruined even if you describe it."},
    {rank:2,author:"josh_larsen",text:"A thriller about class anxiety where the tension never breaks — it just transforms, twists, and eventually swallows everything whole. You leave the theatre feeling complicit."},
    {rank:1,author:"natalieabc",text:"Watched it knowing the twist and it's somehow even better. Every frame has a reason to exist. The ram-don scene will live in my brain forever."},
  ]},
  { id:2, title:"Hereditary", year:2018, director:"Ari Aster", stars:"★★★★½", reviews:[
    {rank:3,author:"robinhardwick",text:"The grief in this film is so visceral and raw it feels intrusive to watch. A family trauma drama disguised as a horror movie — the genre bait-and-switch is absolutely merciless."},
    {rank:2,author:"cinephile_m",text:"Toni Collette gives one of the greatest performances in horror history and the Academy completely ignored her. The dinner table scene is the most uncomfortable two minutes of cinema I've ever sat through."},
    {rank:1,author:"midnight_movies",text:"I watched this at noon and still couldn't sleep. The sound design does most of the horror work — that clicking noise will follow me to my grave."},
  ]},
  { id:3, title:"Portrait of a Lady on Fire", year:2019, director:"Céline Sciamma", stars:"★★★★★", reviews:[
    {rank:3,author:"emilygagne",text:"A film about the male gaze made entirely without one. Every convention of the period romance is inverted until what's left is something completely new and devastatingly pure."},
    {rank:2,author:"letterboxd_jess",text:"The last shot destroyed me. I'm not going to describe it. Just know that it's one of the most painful and perfect images cinema has ever produced."},
    {rank:1,author:"cinelover_fr",text:"Two women. A canvas. The sea. And more tension than any action movie I've seen this decade. This is what cinema was invented for."},
  ]},
  { id:4, title:"The Witch", year:2015, director:"Robert Eggers", stars:"★★★★", reviews:[
    {rank:3,author:"horrorgeek92",text:"Not a horror film. A 17th century Puritan family slowly destroying itself from the inside while something watches from the treeline. The supernatural is almost beside the point."},
    {rank:2,author:"black_phillip_fan",text:"Black Phillip is the most terrifying character in horror history and he has maybe four minutes of screen time. The restraint is immaculate. Robert Eggers arrived fully formed."},
    {rank:1,author:"anya_watches",text:"Wouldst thou like to live deliciously? I've never related so hard to a line of dialogue delivered by a goat. The ending is pure liberation."},
  ]},
  { id:5, title:"Annihilation", year:2018, director:"Alex Garland", stars:"★★★★", reviews:[
    {rank:3,author:"scifilover_p",text:"A sci-fi film that actually feels alien. The director isn't interested in explaining the shimmer — only in what it does to the people who enter it and the audience watching them."},
    {rank:2,author:"natalie_p_era",text:"The lighthouse sequence made me physically lean back in my seat. I've never seen horror and beauty fused so seamlessly. That image of the figure moving on the floor…"},
    {rank:1,author:"brendan_t",text:"Self-destruction as theme, as plot, as form. The structure of the film IS the subject matter. This is what ambitious cinema looks like when it refuses to apologize for its ambitions."},
  ]},
  { id:6, title:"Moonlight", year:2016, director:"Barry Jenkins", stars:"★★★★★", reviews:[
    {rank:3,author:"barryjenkins_fan",text:"Three chapters, one man, a lifetime of silence. The weight of everything never said, every emotion swallowed, every wall built and hidden behind — felt in every single frame."},
    {rank:2,author:"oscar_night_2017",text:"The beach scene in chapter one might be the most tender thing I've ever seen in an American film. A child being taught how to exist in water. The metaphor is doing enormous work."},
    {rank:1,author:"kevinharrison_jr",text:"The whole film is the answer to one question. And the answer is given in a look, not words. Trevante Rhodes communicates more with his jaw than most actors do with a monologue."},
  ]},
  { id:7, title:"La La Land", year:2016, director:"Damien Chazelle", stars:"★★★★", reviews:[
    {rank:3,author:"damien_fan",text:"Nostalgia weaponized against the audience personally. The epilogue sequence is one of the greatest five minutes in film history and I will die defending that claim."},
    {rank:2,author:"jazz_and_cinema",text:"A love story about two people choosing their dreams over each other. The most romantic ending is also the saddest. What could have been is sometimes more real than what was."},
    {rank:1,author:"emma_stone_forever",text:"Cried the first time. Cried harder the second time knowing exactly when the knife was coming. The opening number in the traffic jam is pure joy. The closing twenty minutes is pure grief."},
  ]},
  { id:8, title:"Everything Everywhere All at Once", year:2022, director:"Daniels", stars:"★★★★★", reviews:[
    {rank:3,author:"a24_addict",text:"A film about depression and nihilism disguised as a multiverse action comedy. The rocks scene made me cry. The googly eyes made me cry harder. I don't fully understand why and I think that's the point."},
    {rank:2,author:"michelle_yeoh_appr",text:"Michelle Yeoh's face in the final act contains multitudes. She doesn't have a monologue — she just looks at her daughter and every bad feeling you've ever had about your parents dissolves."},
    {rank:1,author:"hot_dog_fingers",text:"The most purely cinematic experience I've had in a theater since I was a child. Chaotic and overwhelming and somehow coherent. I will never look at googly eyes the same way."},
  ]},
  { id:9, title:"Get Out", year:2017, director:"Jordan Peele", stars:"★★★★½", reviews:[
    {rank:3,author:"jordan_peele_stan",text:"A horror film that uses genre mechanics to talk about something real and insidious. The sunken place is the most precise metaphor for a specific kind of lived experience that cinema has ever produced."},
    {rank:2,author:"social_thriller",text:"The party scene is unbearable to sit through. You watch the protagonist smile and deflect and you feel every microaggression landing. Discomfort made into an art form."},
    {rank:1,author:"allison_w_defense",text:"The milk and the cereal. I think about that scene constantly. Horror embedded in the most mundane domestic image. Jordan Peele is not playing games."},
  ]},
  { id:10, title:"Aftersun", year:2022, director:"Charlotte Wells", stars:"★★★★★", reviews:[
    {rank:3,author:"paul_mescal_crying",text:"A film that hits you once and then hits you again three days later when you're doing dishes. The horror is entirely retroactive and therefore inescapable. A debut that most directors never match in a career."},
    {rank:2,author:"aftersun_letters",text:"The Under Pressure scene. I won't describe it. I'll just say it's the most devastating use of a song in recent cinema and that I've never been the same since."},
    {rank:1,author:"scotland_on_film",text:"What did you want to be when you grew up? I've never heard a more terrifying question. The whole film is a child not understanding what she was watching. The whole point is that she understands now."},
  ]},
  { id:11, title:"Mulholland Drive", year:2001, director:"David Lynch", stars:"★★★★★", reviews:[
    {rank:3,author:"lynch_dream",text:"I fell asleep during the first watch, woke up, and the movie somehow made more sense. Operating on a frequency humans weren't designed to hear."},
    {rank:2,author:"naomi_watts_era",text:"The diner scene with the monster behind the wall destroyed me. I still think about it at random moments three years later, usually at night."},
    {rank:1,author:"silencio_forever",text:"A love letter to Hollywood written in disappearing ink. Every rewatch I find new corridors. The dream logic is the only logic."},
  ]},
  { id:12, title:"Blade Runner 2049", year:2017, director:"Denis Villeneuve", stars:"★★★★½", reviews:[
    {rank:3,author:"deakins_worship",text:"Three hours of the cinematographer painting with light and I would have sat for three more. The scene in the orange wasteland made me forget to breathe."},
    {rank:2,author:"imax_seeker",text:"Saw it in IMAX. The sound design alone is worth the price of a therapist. This movie asks what it means to have a soul, then refuses to answer. Correct."},
    {rank:1,author:"ryan_g_fan",text:"One of the loneliest films ever made. K is the saddest character in modern sci-fi and Gosling barely says fifteen words per act. Devastating."},
  ]},
  { id:13, title:"The Power of the Dog", year:2021, director:"Jane Campion", stars:"★★★★", reviews:[
    {rank:3,author:"campion_returns",text:"Psychological tension that never fully arrives — and that's scarier than if it did. Every scene has an undercurrent of violence. The landscape is a weapon as much as any character."},
    {rank:2,author:"benedict_c_fan",text:"Cumberbatch plays cruelty as a form of self-protection and it is genuinely disturbing. The film reveals his character slowly, like peeling back dead skin."},
    {rank:1,author:"montana_wide",text:"The landscape is a character. The silence is a weapon. And the final revelation recontextualizes everything you watched with a cruelty that takes your breath away."},
  ]},
  { id:14, title:"Whiplash", year:2014, director:"Damien Chazelle", stars:"★★★★½", reviews:[
    {rank:3,author:"jazz_drummer",text:"Not a film about music. A film about the violence of perfectionism, about whether greatness can be extracted through cruelty, and whether that greatness is even worth having."},
    {rank:2,author:"jk_simmons_god",text:"J.K. Simmons is terrifying without ever raising a fist. The abuse is psychological, methodical, almost pedagogical. The scariest teacher ever put on screen."},
    {rank:1,author:"finale_forever",text:"The final concert scene is one of the most exhilarating sequences in cinema. I forgot it was a movie. My hands were sweating. My jaw was clenched. Perfect."},
  ]},
  { id:15, title:"The Favourite", year:2018, director:"Yorgos Lanthimos", stars:"★★★★", reviews:[
    {rank:3,author:"lanthimos_cult",text:"A period drama that refuses to behave like one. The fisheye lens, the anachronistic music, the razor-sharp dialogue — historical settings made to feel profoundly, disturbingly contemporary."},
    {rank:2,author:"olivia_colman_fan",text:"Three women clawing for power in a palace and every single one of them is the protagonist, the villain, and the victim simultaneously. The performances are immaculate."},
    {rank:1,author:"rabbits_ending",text:"That ending with the rabbits is one of the most unsettling images I've seen in a mainstream film. It lingers. It refuses to mean just one thing. It's perfect."},
  ]},
  { id:16, title:"Tár", year:2022, director:"Todd Field", stars:"★★★★½", reviews:[
    {rank:3,author:"classical_cinema",text:"A film about power, about how we consume art made by terrible people, and about the terrifying logic of accountability from inside the machine. The director disappeared for 16 years and came back with this."},
    {rank:2,author:"cate_blanchett_era",text:"Cate Blanchett gives the best performance of the decade. She plays a conductor who has never once considered that the rules apply to her. The unraveling is excruciating."},
    {rank:1,author:"conductor_watch",text:"The opening interview sequence is fifteen minutes long and it sets up every single thing the film will destroy. The patience of this movie is extraordinary."},
  ]},
  { id:17, title:"Drive", year:2011, director:"Nicolas Winding Refn", stars:"★★★★", reviews:[
    {rank:3,author:"neon_noir_fan",text:"A Hollywood genre film buried under so many layers of European art cinema that it became something completely unclassifiable. The silence is deafening. The violence comes from nowhere."},
    {rank:2,author:"gosling_scorpion",text:"Ryan Gosling barely speaks and it's the most expressive performance of his career. The elevator scene contains more emotion in thirty seconds than most films manage in two hours."},
    {rank:1,author:"kavinsky_dreams",text:"The soundtrack alone makes it iconic. But it's the combination of dreamy 80s synth and sudden, grotesque violence that makes it genuinely unforgettable."},
  ]},
  { id:18, title:"The Social Network", year:2010, director:"David Fincher", stars:"★★★★½", reviews:[
    {rank:3,author:"fincher_faithful",text:"A Greek tragedy set in a dorm room. The founding of a company that reshaped human connection — told as a story of pure, unbridled betrayal. The dialogue moves at a speed human beings cannot sustain."},
    {rank:2,author:"sorkin_typed",text:"The opening scene is five minutes of the fastest dialogue ever written and it tells you everything about who the protagonist is. The rest of the film is just watching him prove it."},
    {rank:1,author:"trent_reznor_fan",text:"Trent Reznor and Atticus Ross won the Oscar and it wasn't even close. The score doesn't underline the emotion — it replaces it. Cold, propulsive, inevitable."},
  ]},
  { id:19, title:"Marriage Story", year:2019, director:"Noah Baumbach", stars:"★★★★½", reviews:[
    {rank:3,author:"divorce_cinema",text:"A film about divorce that is also the most tender love story of the decade. The argument scene is one of the greatest pieces of acting ever committed to film — two people saying the unsayable."},
    {rank:2,author:"adam_driver_stans",text:"Adam Driver singing 'Being Alive' at the end destroyed something in me that I haven't fully rebuilt. He just stands there and sings and the whole film collapses into it."},
    {rank:1,author:"scarjo_legal",text:"The lawyer scenes are devastatingly funny and then suddenly devastating. Laura Dern plays someone who understands that the law is not about fairness, and she eats every scene she's in."},
  ]},
  { id:20, title:"Past Lives", year:2023, director:"Celine Song", stars:"★★★★★", reviews:[
    {rank:3,author:"celine_song_debut",text:"The most devastating film of 2023 and it never once raises its voice. The saddest things in life are not tragedies but choices — and the lives unlived because of them."},
    {rank:2,author:"greta_lee_forever",text:"Greta Lee in the final scene, in the car, alone — I've never seen a face carry so much simultaneously. Joy and grief and love and loss in one expression. How?"},
    {rank:1,author:"in_yun_believer",text:"The concept of in-yun — that meeting someone requires 8,000 layers of fate — makes the ending unbearable. Because if all that was needed to get here, what does here even mean?"},
  ]},
  { id:21, title:"Oppenheimer", year:2023, director:"Christopher Nolan", stars:"★★★★½", reviews:[
    {rank:3,author:"nolan_faithful",text:"A three-hour film about a man who invented the apocalypse and it never once feels long. The trial scenes are more tense than any action sequence the director has ever shot."},
    {rank:2,author:"cillian_era",text:"Cillian Murphy's eyes contain the entire film. He plays a man watching himself become a symbol and losing himself in the process. The weight of that is in every frame he's in."},
    {rank:1,author:"trinity_test_fan",text:"The Trinity test sequence. No score. Just silence, then the blast, then the sound catching up. I've never felt dread in an IMAX theater like that. I understood, physically, what it felt like to witness the end."},
  ]},
  { id:22, title:"The Holdovers", year:2023, director:"Alexander Payne", stars:"★★★★½", reviews:[
    {rank:3,author:"payne_comeback",text:"So warm and funny and sad that I forgot I was watching a film. It just felt like spending time with people I loved and then having to say goodbye. A film about loneliness that refuses to be lonely."},
    {rank:2,author:"paul_giamatti_again",text:"Paul Giamatti hasn't been this good since Sideways, which is saying everything. He plays a man whose entire personality is a wall he built to keep people out, and the film is about one Christmas that damaged the wall."},
    {rank:1,author:"da_vine_joy_randolph",text:"Da'Vine Joy Randolph. Full stop. Her grief is the moral center of the film and she carries it with such dignity and such pain that every scene she's in becomes the most important scene in the movie."},
  ]},
  { id:23, title:"Saltburn", year:2023, director:"Emerald Fennell", stars:"★★★★", reviews:[
    {rank:3,author:"fennell_obsession",text:"A film about obsession and class that refuses to be a morality tale. The estate itself is a character — vast, golden, indifferent. The camera loves excess the same way the protagonist does."},
    {rank:2,author:"barry_keoghan_fan",text:"Barry Keoghan spends two hours making you believe one thing and then the film ends and you realize you believed nothing. The performance is a long con and he never breaks character for a second."},
    {rank:1,author:"final_dance_forever",text:"The final scene. I watched it three times. I cannot tell if it's empowering or horrifying. I think that's the point. The director holds the camera steady and lets you sit with it."},
  ]},
];

// ════════════════════════════════════════════════════════════
//  SONGS DATA
//  audioUrl: ruta al archivo en /public/songs/
//  Los MP3 deben ser clips de 11 segundos máximo.
//  Naming sugerido: kebab-case del título, ej: "do-i-wanna-know.mp3"
// ════════════════════════════════════════════════════════════
const SONGS = [
  // ── Arctic Monkeys ──
  
  { id:13, title:"Ready to Start",                 artist:"Arcade Fire",       year:2010, audioUrl:"/songs/ready-to-start.mp3"            },
  { id:1, title:"Champagne Supernova",                 artist:"Arcade Fire",       year:2010, audioUrl:"/songs/Champagne Supernova.mp3"            },
  { id:2, title:"Come As You Are",                 artist:"Arcade Fire",       year:2010, audioUrl:"/songs/Come As You Are.mp3"            },
  { id:3, title:"Creep",                 artist:"Arcade Fire",       year:2010, audioUrl:"/songs/Creep.mp3"            },
  { id:4, title:"Don't Look Back in Anger",                 artist:"Arcade Fire",       year:2010, audioUrl:"/songs/Don't Look Back in Anger.mp3"            },
  { id:5, title:"Friday I'm in Love",                 artist:"Arcade Fire",       year:2010, audioUrl:"/songs/Friday I'm in Love.mp3"            },
  { id:5, title:"Karma Police",                 artist:"Arcade Fire",       year:2010, audioUrl:"/songs/Karma Police.mp3"            },
  // ── Nirvana ──
  
];

// ════════════════════════════════════════════════════════════
//  GLOBAL CSS
// ════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#14181c;--surface:#1c2228;--surface2:#212830;
    --border:#2c3440;--border2:#3a4455;
    --green:#00c030;--green-dark:#009924;--green-glow:rgba(0,192,48,0.12);
    --blue:#40bcf4;--blue-glow:rgba(64,188,244,0.12);--blue-dark:#1a8abf;
    --orange:#ff8000;
    --text:#9ab;--text-bright:#cdd5db;--text-dim:#4a5568;
    --radius:8px;--font:'DM Sans',system-ui,sans-serif;--serif:'Source Serif 4',Georgia,serif;
  }
  html,body{background:var(--bg);color:var(--text-bright);font-family:var(--font);min-height:100vh;-webkit-font-smoothing:antialiased}
  .app{min-height:100vh;display:flex;flex-direction:column;align-items:center;background:var(--bg)}

  /* ── NAV ── */
  .nav{width:100%;max-width:680px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:30}
  .nav-brand{display:flex;align-items:center;gap:8px;cursor:pointer}
  .nav-dots{display:flex;gap:3px;align-items:center}
  .nav-dot{border-radius:50%}
  .nav-dot:nth-child(1){width:8px;height:8px;background:var(--green)}
  .nav-dot:nth-child(2){width:10px;height:10px;background:var(--blue)}
  .nav-dot:nth-child(3){width:8px;height:8px;background:var(--orange)}
  .nav-title{font-family:var(--serif);font-size:1rem;color:var(--text-bright)}
  .nav-right{display:flex;align-items:center;gap:0.75rem}
  .nav-date{font-size:0.68rem;color:var(--text-dim);letter-spacing:0.06em;font-weight:500;text-transform:uppercase}
  .nav-back{font-size:0.72rem;color:var(--text-dim);cursor:pointer;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;transition:color 0.15s;border:none;background:none;padding:0.2rem 0.5rem}
  .nav-back:hover{color:var(--text-bright)}

  /* ── HOME ── */
  .home{width:100%;max-width:680px;padding:3rem 1.25rem;display:flex;flex-direction:column;align-items:center;gap:2.5rem}
  .home-hero{display:flex;flex-direction:column;align-items:center;gap:0.75rem;text-align:center}
  .home-title{font-family:var(--serif);font-size:clamp(1.8rem,5vw,2.6rem);font-weight:300;color:var(--text-bright);line-height:1.1}
  .home-sub{font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);font-weight:600}
  .home-cards{display:grid;grid-template-columns:1fr 1fr;gap:1rem;width:100%}
  @media(max-width:500px){.home-cards{grid-template-columns:1fr}}
  .home-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.75rem 1.5rem;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;gap:1rem}
  .home-card:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
  .home-card.green:hover{border-color:var(--green-dark)}
  .home-card.blue:hover{border-color:var(--blue-dark)}
  .home-card-icon{font-size:1.75rem}
  .home-card-name{font-family:var(--serif);font-size:1.2rem;font-weight:400;color:var(--text-bright)}
  .home-card-desc{font-size:0.78rem;color:var(--text-dim);line-height:1.5}
  .home-card-badge{display:flex;align-items:center;gap:0.35rem;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:auto}
  .home-card.green .home-card-badge{color:var(--green)}
  .home-card.blue .home-card-badge{color:var(--blue)}
  .badge-dot{width:5px;height:5px;border-radius:50%}
  .home-card.green .badge-dot{background:var(--green)}
  .home-card.blue .badge-dot{background:var(--blue)}

  /* ── MAIN WRAPPER ── */
  .main{width:100%;max-width:680px;padding:1.5rem 1.25rem 3rem;display:flex;flex-direction:column;gap:1.25rem}

  /* ── LETTERBOXD GAME ── */
  .header-label{font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-dim);font-weight:600;margin-bottom:0.25rem}
  .header-title{font-family:var(--serif);font-size:clamp(1.1rem,3vw,1.5rem);font-weight:300;color:var(--text-bright);line-height:1.25}
  .pips-row{display:flex;gap:6px;align-items:center}
  .pip-wrap{display:flex;flex-direction:column;gap:3px;align-items:center}
  .pip{width:40px;height:3px;border-radius:2px;background:var(--border);transition:background 0.3s}
  .pip.lit{background:var(--green)}
  .pip.used{background:var(--border2)}
  .pip-label{font-size:0.55rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);font-weight:600}
  .pip-sep{width:1px;height:16px;background:var(--border);margin:0 4px}
  .pts-now{font-size:0.7rem;font-weight:700;color:var(--text-dim)}
  .pts-now b{color:var(--green);font-size:0.85rem}
  .scene{perspective:1100px;width:100%}
  .card-wrap{position:relative;width:100%;min-height:240px;transform-style:preserve-3d;transition:transform 0.65s cubic-bezier(0.35,0,0.2,1)}
  .card-wrap.flipped{transform:rotateY(180deg)}
  .card-face,.card-rear{width:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:12px;background:var(--surface)}
  .card-face{border:1px solid var(--border)}
  .card-rear{position:absolute;inset:0;height:100%;transform:rotateY(180deg);border:1px solid var(--green-dark);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;gap:0.75rem;text-align:center}
  .front-body{padding:1.5rem 1.75rem;display:flex;flex-direction:column;gap:1.1rem;min-height:240px}
  .hint-meta{display:flex;align-items:center;justify-content:space-between}
  .hint-tag{display:flex;align-items:center;gap:0.4rem;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-dim)}
  .hint-dot{width:5px;height:5px;border-radius:50%;background:var(--green)}
  .pts-pill{font-size:0.65rem;padding:0.15rem 0.45rem;border-radius:4px;border:1px solid var(--border);color:var(--text-dim);font-weight:600}
  .pts-pill b{color:var(--green)}
  .quote-area{flex:1;display:flex;flex-direction:column;gap:0.6rem}
  .stars-orange{color:var(--orange);font-size:0.82rem;letter-spacing:-0.5px}
  .quote-text{font-family:var(--serif);font-size:clamp(0.88rem,2vw,1.05rem);font-weight:300;line-height:1.72;color:var(--text-bright);font-style:italic;flex:1}
  .quote-author{font-size:0.68rem;color:var(--text-dim);font-weight:500}
  .quote-author span{color:var(--green)}
  .tap-hint{font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);text-align:center;padding-top:0.65rem;border-top:1px solid var(--border);opacity:0.4;cursor:pointer;transition:opacity 0.15s}
  .tap-hint:hover{opacity:0.7}
  .rear-icon{font-size:2rem}
  .rear-title{font-family:var(--serif);font-size:clamp(1.2rem,4vw,1.8rem);font-weight:400;color:var(--text-bright);line-height:1.2}
  .rear-meta{font-size:0.73rem;color:var(--text-dim);letter-spacing:0.04em}
  .rear-stars{color:var(--orange);font-size:0.95rem;letter-spacing:-0.5px}
  .actions{display:flex;flex-direction:column;gap:0.8rem}
  .toast{padding:0.8rem 1rem;border-radius:var(--radius);font-size:0.86rem;font-weight:500;text-align:center;animation:up 0.2s ease}
  .toast.ok{background:rgba(0,192,48,0.07);border:1px solid var(--green-dark);color:var(--green)}
  .toast.fail{background:rgba(255,80,80,0.06);border:1px solid #5a2a2a;color:#e07070}
  .toast.info{background:var(--surface2);border:1px solid var(--border2);color:var(--text)}
  @keyframes up{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  .input-wrap{position:relative;width:100%}
  .input-row{display:flex;gap:0.5rem}
  .guess-inp{flex:1;padding:0.75rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-bright);font-family:var(--font);font-size:0.9rem;outline:none;transition:border-color 0.15s;width:100%}
  .guess-inp:focus{border-color:var(--green-dark)}
  .guess-inp.has-sug{border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom-color:transparent}
  .guess-inp::placeholder{color:var(--text-dim)}
  .guess-btn{padding:0.75rem 1.25rem;background:var(--green);border:none;border-radius:var(--radius);color:#000;font-family:var(--font);font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;align-self:flex-start}
  .guess-btn:hover{background:#00d836}
  .suggestions{position:absolute;top:100%;left:0;right:0;background:var(--surface);border:1px solid var(--green-dark);border-top:none;border-bottom-left-radius:var(--radius);border-bottom-right-radius:var(--radius);overflow:hidden;z-index:20;box-shadow:0 8px 24px rgba(0,0,0,0.4)}
  .sug-item{padding:0.65rem 1rem;font-size:0.88rem;color:var(--text-bright);cursor:pointer;transition:background 0.1s;display:flex;align-items:center;gap:0.5rem}
  .sug-item:hover,.sug-item.focused{background:var(--green-glow);color:var(--green)}
  .sug-item:not(:last-child){border-bottom:1px solid var(--border)}
  .sug-hl{color:var(--green);font-weight:600}
  .sug-year{font-size:0.72rem;color:var(--text-dim);margin-left:auto}
  .hint-actions{display:flex;gap:0.5rem;flex-wrap:wrap}
  .btn-ghost{padding:0.6rem 1rem;border-radius:var(--radius);cursor:pointer;font-family:var(--font);font-size:0.75rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.15s;border:1px solid var(--border2);background:transparent;color:var(--text-dim)}
  .btn-ghost:hover{border-color:var(--text);color:var(--text-bright)}
  .btn-ghost.danger{border-color:#4a2020;color:#a05050}
  .btn-ghost.danger:hover{border-color:#7a3030;color:#e07070}

  /* ── DONE / TOMORROW ── */
  .tomorrow{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:1.75rem;padding:2rem;text-align:center;width:100%;max-width:680px}
  .tomorrow-icon{font-size:3rem}
  .tomorrow-title{font-family:var(--serif);font-size:clamp(1.4rem,5vw,2rem);font-weight:300;color:var(--text-bright);line-height:1.25}
  .tomorrow-title em{font-style:normal}
  .tomorrow-title.green em{color:var(--green)}
  .tomorrow-title.blue em{color:var(--blue)}
  .result-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem 1.75rem;display:flex;flex-direction:column;gap:1rem;width:100%;max-width:400px}
  .t-label{font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-dim);font-weight:600}
  .t-main-title{font-family:var(--serif);font-size:1.25rem;color:var(--text-bright);margin-top:0.2rem}
  .t-meta{font-size:0.72rem;color:var(--text-dim);margin-top:0.1rem}
  .divider{width:100%;height:1px;background:var(--border)}
  .score-row{display:flex;align-items:center;justify-content:space-between;padding:0.7rem 0.9rem;border-radius:var(--radius);background:var(--surface2);border:1px solid var(--border)}
  .score-row-label{font-size:0.72rem;color:var(--text-dim);font-weight:500}
  .score-row-val{font-size:1.15rem;font-weight:700;font-family:var(--font)}
  .score-row-val.green{color:var(--green)}
  .score-row-val.blue{color:var(--blue)}
  .streak-pill{display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;border-radius:100px;background:var(--surface2);border:1px solid var(--border);font-size:0.72rem;color:var(--text-dim);font-weight:500;align-self:center}
  .streak-pill b{color:var(--orange)}
  .countdown-box{display:flex;flex-direction:column;align-items:center;gap:0.35rem}
  .countdown-label{font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);font-weight:600}
  .countdown{font-family:var(--font);font-size:1.7rem;font-weight:600;color:var(--text-bright);letter-spacing:0.04em}
  .countdown span{color:var(--text-dim);font-weight:300;font-size:1.1rem}

  /* ── SONG GAME ── */
  .song-header{display:flex;flex-direction:column;gap:0.25rem}
  .song-progress-row{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
  .seg{width:28px;height:4px;border-radius:2px;background:var(--border);transition:background 0.3s;cursor:default}
  .seg.unlocked{background:var(--border2)}
  .seg.active{background:var(--blue)}
  .seg-label{font-size:0.6rem;color:var(--text-dim);font-weight:600;letter-spacing:0.06em;margin-left:6px}
  .player-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.75rem;display:flex;flex-direction:column;gap:1.25rem;align-items:center}
  .player-wave{display:flex;align-items:flex-end;gap:3px;height:40px}
  .wave-bar{width:4px;border-radius:2px;background:var(--border2);transition:height 0.1s,background 0.2s}
  .wave-bar.active{background:var(--blue)}
  .play-btn{width:64px;height:64px;border-radius:50%;border:2px solid var(--blue);background:var(--blue-glow);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;color:var(--blue);font-size:1.5rem}
  .play-btn:hover{background:rgba(64,188,244,0.2);transform:scale(1.05)}
  .play-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
  .play-btn.playing{border-color:var(--orange);color:var(--orange);background:rgba(255,128,0,0.1)}
  .play-btn.playing:hover{background:rgba(255,128,0,0.18)}
  .timer-text{font-family:var(--font);font-size:0.75rem;color:var(--text-dim);font-weight:600;letter-spacing:0.08em}
  .timer-text b{color:var(--blue)}
  .more-btn{padding:0.6rem 1.25rem;border-radius:var(--radius);cursor:pointer;font-family:var(--font);font-size:0.78rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.15s;border:1px solid var(--blue-dark);background:transparent;color:var(--blue)}
  .more-btn:hover{background:var(--blue-glow)}
  .more-btn:disabled{opacity:0.3;cursor:not-allowed}
  .song-input{flex:1;padding:0.75rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-bright);font-family:var(--font);font-size:0.9rem;outline:none;transition:border-color 0.15s;width:100%}
  .song-input:focus{border-color:var(--blue-dark)}
  .song-input.has-sug{border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom-color:transparent}
  .song-input::placeholder{color:var(--text-dim)}
  .song-btn{padding:0.75rem 1.25rem;background:var(--blue);border:none;border-radius:var(--radius);color:#000;font-family:var(--font);font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;align-self:flex-start}
  .song-btn:hover{background:#5acef8}
  .song-sug{border-color:var(--blue-dark) !important}
  .song-sug .sug-item:hover,.song-sug .sug-item.focused{background:var(--blue-glow);color:var(--blue)}

  /* ── HISTORY ── */
  .history-btn{font-size:0.7rem;color:var(--text-dim);cursor:pointer;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;text-decoration:underline;text-underline-offset:3px;background:none;border:none;padding:0}
  .history-btn:hover{color:var(--text-bright)}
  .history-grid{display:flex;flex-direction:column;gap:0.5rem;width:100%}
  .history-row{display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;border-radius:var(--radius);background:var(--surface);border:1px solid var(--border);cursor:pointer;transition:border-color 0.15s}
  .history-row:hover{border-color:var(--border2)}
  .history-date{font-size:0.65rem;color:var(--text-dim);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;min-width:60px}
  .history-info{flex:1}
  .history-title{font-size:0.88rem;color:var(--text-bright);font-weight:500}
  .history-sub{font-size:0.7rem;color:var(--text-dim)}
  .history-pts{font-size:0.8rem;font-weight:700}
  .history-pts.green{color:var(--green)}
  .history-pts.blue{color:var(--blue)}
  .history-pts.dim{color:var(--text-dim)}


`;

// ════════════════════════════════════════════════════════════
//  HIGHLIGHT MATCH COMPONENT
// ════════════════════════════════════════════════════════════
function HighlightMatch({ text, query }) {
  const idx = normalize(text).indexOf(normalize(query));
  if (idx === -1 || !query) return <span>{text}</span>;
  return <span>{text.slice(0,idx)}<span className="sug-hl">{text.slice(idx,idx+query.length)}</span>{text.slice(idx+query.length)}</span>;
}

// ════════════════════════════════════════════════════════════
//  AUDIO — usa Web Audio API nativa con archivos MP3 en /public/songs/
//  Naming convention: el campo audioUrl de cada canción apunta a /songs/nombre.mp3
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  LETTERBOXD GAME
// ════════════════════════════════════════════════════════════
const LB_HINT_NAMES = ["3ª reseña","2ª reseña","1ª reseña"];
const LB_POINTS = [3,2,1];

function LetterboxdGame({ onBack }) {
  const todayKey = getTodayKey();
  const dayIdx = getDayIndex();
  const movie = MOVIES[((dayIdx % MOVIES.length) + MOVIES.length) % MOVIES.length];

  const saved = (() => { try { return JSON.parse(localStorage.getItem("gtf_lb")||"{}"); } catch { return {}; } })();
  const alreadyPlayed = saved.date === todayKey;

  const [hintLevel, setHintLevel] = useState(0);
  const [flipped, setFlipped] = useState(alreadyPlayed);
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focusedSug, setFocusedSug] = useState(-1);
  const [feedback, setFeedback] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [roundOver, setRoundOver] = useState(alreadyPlayed);
  const [score, setScore] = useState(alreadyPlayed ? (saved.score ?? 0) : null);
  const [screen, setScreen] = useState(alreadyPlayed ? "done" : "game");
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [streak, setStreak] = useState(saved.streak ?? 0);
  const inputRef = useRef(null);
  const sugRef = useRef(null);

  useEffect(() => {
    if (screen !== "done") return;
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    function h(e) { if (sugRef.current && !sugRef.current.contains(e.target) && e.target !== inputRef.current) setSuggestions([]); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function persist(sc, hl) {
    const y = (() => { const d=new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; })();
    const newStreak = saved.date === y ? (saved.streak ?? 0) + 1 : 1;
    setStreak(newStreak);
    // Save to history
    const hist = (() => { try { return JSON.parse(localStorage.getItem("gtf_lb_hist")||"[]"); } catch { return []; } })();
    const entry = { date:todayKey, dayIdx, title:movie.title, year:movie.year, director:movie.director, score:sc };
    const filtered = hist.filter(h => h.date !== todayKey);
    localStorage.setItem("gtf_lb_hist", JSON.stringify([entry, ...filtered].slice(0,60)));
    localStorage.setItem("gtf_lb", JSON.stringify({ date:todayKey, score:sc, hintLevel:hl, streak:newStreak }));
  }

  const review = movie.reviews.find(r => r.rank === 3 - hintLevel);

  function handleGuessChange(val) {
    setGuess(val); setFocusedSug(-1);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    setSuggestions(MOVIES.filter(m => normalize(m.title).includes(normalize(val))).slice(0,5));
  }

  function submitGuess(titleOverride) {
    const value = titleOverride ?? guess;
    if (!value.trim()) return;
    setSuggestions([]);
    const hit = normalize(movie.title).includes(normalize(value)) || normalize(value).includes(normalize(movie.title));
    if (hit) {
      const pts = LB_POINTS[hintLevel];
      setScore(pts); setFeedback("ok"); setFeedbackMsg(`¡Correcto! +${pts} ${pts===1?"punto":"puntos"}`);
      setFlipped(true); setRoundOver(true); persist(pts, hintLevel);
      setTimeout(() => setScreen("done"), 2000);
    } else {
      if (hintLevel < 2) {
        setFeedback("fail"); setFeedbackMsg("Incorrecto — pasando a la siguiente pista…");
        setTimeout(() => { setHintLevel(h => h+1); setFeedback(null); setFeedbackMsg(""); }, 1200);
      } else {
        setFeedback("fail"); setFeedbackMsg(`Incorrecto. Era "${movie.title}"`);
        setFlipped(true); setRoundOver(true); setScore(0); persist(0, hintLevel);
        setTimeout(() => setScreen("done"), 2400);
      }
    }
    setGuess("");
  }

  function handleGiveUp() {
    setSuggestions([]);
    setFlipped(true); setScore(0); setRoundOver(true);
    setFeedback("info"); setFeedbackMsg(`La película era "${movie.title}" (${movie.year})`);
    persist(0, hintLevel);
    setTimeout(() => setScreen("done"), 2200);
  }

  function handleKeyDown(e) {
    if (suggestions.length === 0) { if (e.key==="Enter") submitGuess(); return; }
    if (e.key==="ArrowDown") { e.preventDefault(); setFocusedSug(i => Math.min(i+1,suggestions.length-1)); }
    else if (e.key==="ArrowUp") { e.preventDefault(); setFocusedSug(i => Math.max(i-1,-1)); }
    else if (e.key==="Enter") { e.preventDefault(); focusedSug>=0 ? submitGuess(suggestions[focusedSug].title) : submitGuess(); }
    else if (e.key==="Escape") setSuggestions([]);
  }

  const hintUsed = score != null && score > 0 ? LB_HINT_NAMES[LB_POINTS.indexOf(score)] : null;
  const today = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" });
  const todayStr = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <>
      {screen === "game" && (
        <div className="main">
          <div>
            <p className="header-label">Película del día</p>
            <h1 className="header-title">¿De qué película es esta reseña?</h1>
          </div>
          <div className="pips-row">
            {[0,1,2].map(i => (
              <div key={i} className="pip-wrap">
                <div className={`pip${i===hintLevel?" lit":i<hintLevel?" used":""}`}/>
                <span className="pip-label">{LB_POINTS[i]}pt</span>
              </div>
            ))}
            <div className="pip-sep"/>
            <span className="pts-now">Pista actual: <b>{LB_POINTS[hintLevel]} pts</b></span>
          </div>
          <div className="scene">
            <div className={`card-wrap${flipped?" flipped":""}`}>
              <div className="card-face">
                <div className="front-body">
                  <div className="hint-meta">
                    <div className="hint-tag"><div className="hint-dot"/>{LB_HINT_NAMES[hintLevel]}</div>
                    <div className="pts-pill"><b>{LB_POINTS[hintLevel]}</b> pts</div>
                  </div>
                  <div className="quote-area">
                    <div className="stars-orange">{movie.stars}</div>
                    <p className="quote-text">"{review?.text}"</p>
                    <p className="quote-author">— <span>@{review?.author}</span></p>
                  </div>
                  <p className="tap-hint" onClick={handleGiveUp}>Tocar para revelar sin adivinar</p>
                </div>
              </div>
              <div className="card-rear">
                <div className="rear-icon">🎬</div>
                <h2 className="rear-title">{movie.title}</h2>
                <p className="rear-meta">{movie.year} · {movie.director}</p>
                <div className="rear-stars">{movie.stars}</div>
              </div>
            </div>
          </div>
          <div className="actions">
            {feedback && <div className={`toast ${feedback}`}>{feedbackMsg}</div>}
            {!roundOver && (
              <>
                <div className="input-row">
                  <div className="input-wrap">
                    <input ref={inputRef} className={`guess-inp${suggestions.length>0?" has-sug":""}`}
                      placeholder="Escribí el título de la película..."
                      value={guess} onChange={e => handleGuessChange(e.target.value)}
                      onKeyDown={handleKeyDown} autoComplete="off" autoCorrect="off" spellCheck="false"/>
                    {suggestions.length > 0 && (
                      <div className="suggestions" ref={sugRef}>
                        {suggestions.map((m,i) => (
                          <div key={m.id} className={`sug-item${i===focusedSug?" focused":""}`}
                            onMouseDown={e => { e.preventDefault(); submitGuess(m.title); }}
                            onMouseEnter={() => setFocusedSug(i)}>
                            <HighlightMatch text={m.title} query={guess}/>
                            <span className="sug-year">{m.year}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="guess-btn" onClick={() => submitGuess()}>OK</button>
                </div>
                <div className="hint-actions">
                  <button className="btn-ghost danger" onClick={handleGiveUp}>Rendirse</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {screen === "done" && (
        <div className="tomorrow">
          <div className="tomorrow-icon">{score===3?"🏆":score===2?"⭐":score===1?"✅":"😔"}</div>
          <h2 className={`tomorrow-title green`}>
            {score > 0 ? <>¡Adivinaste la película del día!</> : <>No pasa nada,<br/><em>volvé mañana</em></>}
          </h2>
          <div className="result-card">
            <div>
              <p className="t-label">Película de hoy</p>
              <p className="t-main-title">{movie.title}</p>
              <p className="t-meta">{movie.year} · {movie.director} · {movie.stars}</p>
            </div>
            <div className="divider"/>
            <div className="score-row">
              <span className="score-row-label">{score > 0 ? `Con la ${hintUsed}` : "Sin puntos hoy"}</span>
              <span className="score-row-val green">{score ?? 0} pts</span>
            </div>
            {streak > 1 && <div className="streak-pill"><span>🔥</span><span><b>{streak}</b> días seguidos</span></div>}
          </div>
          <div className="countdown-box">
            <span className="countdown-label">Próxima película en</span>
            <span className="countdown">{pad(countdown.h)}<span>h</span> {pad(countdown.m)}<span>m</span> {pad(countdown.s)}<span>s</span></span>
          </div>
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  ONE SONG A DAY
// ════════════════════════════════════════════════════════════
const MAX_SECONDS = 11;
const STEP = 2; // seconds added per hint

function SongGame({ onBack }) {
  const todayKey = getTodayKey();
  const dayIdx = getDayIndex();
  // Use a different offset so songs don't align with movies
  const song = SONGS[((dayIdx + 7) % SONGS.length + SONGS.length) % SONGS.length];

  const saved = (() => { try { return JSON.parse(localStorage.getItem("gtf_song")||"{}"); } catch { return {}; } })();
  const alreadyPlayed = saved.date === todayKey;

  const [unlockedSecs, setUnlockedSecs] = useState(alreadyPlayed ? (saved.unlockedSecs ?? 1) : 1);
  const [playing, setPlaying] = useState(false);
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focusedSug, setFocusedSug] = useState(-1);
  const [feedback, setFeedback] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [roundOver, setRoundOver] = useState(alreadyPlayed);
  const [won, setWon] = useState(alreadyPlayed ? (saved.won ?? false) : false);
  const [screen, setScreen] = useState(alreadyPlayed ? "done" : "game");
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [streak, setStreak] = useState(saved.streak ?? 0);
  const [showHistory, setShowHistory] = useState(false);
  const [waveHeights, setWaveHeights] = useState(Array(20).fill(4));
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const sugRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (screen !== "done") return;
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    function h(e) { if (sugRef.current && !sugRef.current.contains(e.target) && e.target !== inputRef.current) setSuggestions([]); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Wave animation while playing
  useEffect(() => {
    if (!playing) { setWaveHeights(Array(20).fill(4)); return; }
    const id = setInterval(() => {
      setWaveHeights(Array(20).fill(0).map(() => 4 + Math.random() * 32));
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  function handlePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.currentTime = 0;
    audio.play().catch(e => console.warn("play() blocked:", e));
    setPlaying(true);
    timerRef.current = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      timerRef.current = null;
    }, unlockedSecs * 1000);
  }

  function stopAudio() {
    const audio = audioRef.current;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setPlaying(false);
  }

  function handleUnlock() {
    if (unlockedSecs + STEP > MAX_SECONDS) return;
    stopAudio();
    setUnlockedSecs(s => s + STEP);
  }

  function persist(w, secs) {
    const y = (() => { const d=new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; })();
    const newStreak = saved.date === y ? (saved.streak ?? 0) + 1 : 1;
    setStreak(newStreak);
    const hist = (() => { try { return JSON.parse(localStorage.getItem("gtf_song_hist")||"[]"); } catch { return []; } })();
    const entry = { date:todayKey, dayIdx, title:song.title, artist:song.artist, year:song.year, won:w, unlockedSecs:secs };
    const filtered = hist.filter(h => h.date !== todayKey);
    localStorage.setItem("gtf_song_hist", JSON.stringify([entry, ...filtered].slice(0,60)));
    localStorage.setItem("gtf_song", JSON.stringify({ date:todayKey, won:w, unlockedSecs:secs, streak:newStreak }));
  }

  function handleGuessChange(val) {
    setGuess(val); setFocusedSug(-1);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    const matches = SONGS.filter(s =>
      normalize(s.title).includes(normalize(val)) || normalize(s.artist).includes(normalize(val))
    ).slice(0,5);
    setSuggestions(matches);
  }

  function submitGuess(titleOverride) {
    const value = titleOverride ?? guess;
    if (!value.trim()) return;
    setSuggestions([]); stopAudio();
    const hit = normalize(song.title).includes(normalize(value)) || normalize(value).includes(normalize(song.title));
    if (hit) {
      setWon(true); setRoundOver(true);
      setFeedback("ok"); setFeedbackMsg(`¡Correcto! Adivinaste con ${unlockedSecs}s`);
      persist(true, unlockedSecs);
      setTimeout(() => setScreen("done"), 2000);
    } else {
      if (unlockedSecs < MAX_SECONDS) {
        setFeedback("fail"); setFeedbackMsg("Incorrecto — se desbloquean 2 segundos más…");
        setTimeout(() => { setUnlockedSecs(s => Math.min(s + STEP, MAX_SECONDS)); setFeedback(null); }, 1200);
      } else {
        setFeedback("fail"); setFeedbackMsg(`Incorrecto. Era "${song.title}" de ${song.artist}`);
        setRoundOver(true); persist(false, unlockedSecs);
        setTimeout(() => setScreen("done"), 2400);
      }
    }
    setGuess("");
  }

  function handleGiveUp() {
    setSuggestions([]); stopAudio();
    setRoundOver(true); persist(false, unlockedSecs);
    setFeedback("info"); setFeedbackMsg(`Era "${song.title}" de ${song.artist}`);
    setTimeout(() => setScreen("done"), 2200);
  }

  function handleKeyDown(e) {
    if (suggestions.length===0) { if (e.key==="Enter") submitGuess(); return; }
    if (e.key==="ArrowDown") { e.preventDefault(); setFocusedSug(i => Math.min(i+1,suggestions.length-1)); }
    else if (e.key==="ArrowUp") { e.preventDefault(); setFocusedSug(i => Math.max(i-1,-1)); }
    else if (e.key==="Enter") { e.preventDefault(); focusedSug>=0 ? submitGuess(suggestions[focusedSug].title) : submitGuess(); }
    else if (e.key==="Escape") setSuggestions([]);
  }

  // Segments: 1,3,5,7,9,11 — 6 segments
  const totalSegments = Math.ceil((MAX_SECONDS - 1) / STEP) + 1; // 1,3,5,7,9,11 = 6
  const segSeconds = [1,3,5,7,9,11];

  const history = (() => { try { return JSON.parse(localStorage.getItem("gtf_song_hist")||"[]"); } catch { return []; } })();

  if (showHistory) {
    return (
      <div className="main">
        <div>
          <p className="header-label">Historial</p>
          <h1 className="header-title">One Song a Day — canciones pasadas</h1>
        </div>
        {history.length === 0
          ? <p style={{color:"var(--text-dim)",fontSize:"0.85rem"}}>Todavía no hay canciones jugadas.</p>
          : <div className="history-grid">
              {history.map((h,i) => (
                <div key={i} className="history-row">
                  <span className="history-date">{h.date}</span>
                  <div className="history-info">
                    <div className="history-title">{h.title}</div>
                    <div className="history-sub">{h.artist} · {h.year}</div>
                  </div>
                  <span className={`history-pts ${h.won?"blue":"dim"}`}>
                    {h.won ? `✓ ${h.unlockedSecs}s` : "✗"}
                  </span>
                </div>
              ))}
            </div>
        }
        <button className="btn-ghost" onClick={() => setShowHistory(false)} style={{alignSelf:"center"}}>← Volver</button>
      </div>
    );
  }

  return (
    <>
      {screen === "game" && (
        <div className="main">
          <div className="song-header">
            <p className="header-label">Canción del día</p>
            <h1 className="header-title">¿De qué canción es este fragmento?</h1>
          </div>

          {/* Segment progress */}
          <div className="song-progress-row">
            {segSeconds.map(s => (
              <div key={s} className={`seg${s<=unlockedSecs?" unlocked":""}${s===unlockedSecs?" active":""}`}/>
            ))}
            <span className="seg-label">{unlockedSecs}s desbloqueados</span>
          </div>

          {/* Player — <audio> nativo, sin dependencias externas */}
          <div className="player-card">
            <audio ref={audioRef} src={song.audioUrl} preload="auto"/>
            <div className="player-wave">
              {waveHeights.map((h,i) => (
                <div key={i} className={`wave-bar${playing?" active":""}`} style={{height:`${h}px`}}/>
              ))}
            </div>
            <button className={`play-btn${playing?" playing":""}`} onClick={handlePlay}>
              {playing ? "■" : "▶"}
            </button>
            <span className="timer-text">
              <b>{unlockedSecs}</b> segundo{unlockedSecs!==1?"s":""} · podés reproducirla las veces que quieras
            </span>
          </div>

          <div className="actions">
            {feedback && <div className={`toast ${feedback}`}>{feedbackMsg}</div>}
            {!roundOver && (
              <>
                <div className="input-row">
                  <div className="input-wrap">
                    <input ref={inputRef} className={`song-input${suggestions.length>0?" has-sug":""}`}
                      placeholder="Escribí el título de la canción o el artista..."
                      value={guess} onChange={e => handleGuessChange(e.target.value)}
                      onKeyDown={handleKeyDown} autoComplete="off" autoCorrect="off" spellCheck="false"/>
                    {suggestions.length > 0 && (
                      <div className="suggestions song-sug" ref={sugRef}>
                        {suggestions.map((s,i) => (
                          <div key={s.id} className={`sug-item${i===focusedSug?" focused":""}`}
                            onMouseDown={e => { e.preventDefault(); submitGuess(s.title); }}
                            onMouseEnter={() => setFocusedSug(i)}>
                            <span>
                              <HighlightMatch text={s.title} query={guess}/>
                              <span style={{color:"var(--text-dim)",fontSize:"0.78rem",marginLeft:"0.4rem"}}>— {s.artist}</span>
                            </span>
                            <span className="sug-year">{s.year}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="song-btn" onClick={() => submitGuess()}>OK</button>
                </div>
                <div className="hint-actions">
                  {unlockedSecs < MAX_SECONDS && (
                    <button className="more-btn" onClick={handleUnlock}>
                      +{STEP}s más →
                    </button>
                  )}
                  <button className="btn-ghost danger" onClick={handleGiveUp}>Rendirse</button>
                </div>
              </>
            )}
          </div>

          <button className="history-btn" onClick={() => setShowHistory(true)}>Ver canciones pasadas →</button>
        </div>
      )}

      {screen === "done" && (
        <div className="tomorrow">
          <div className="tomorrow-icon">{won ? "🎵" : "😔"}</div>
          <h2 className="tomorrow-title blue">
            {won ? <>¡Adivinaste la canción del día!</> : <>No pasa nada,<br/><em>volvé mañana</em></>}
          </h2>
          <div className="result-card">
            <div>
              <p className="t-label">Canción de hoy</p>
              <p className="t-main-title">{song.title}</p>
              <p className="t-meta">{song.artist} · {song.year}</p>
            </div>
            <div className="divider"/>
            <div className="score-row">
              <span className="score-row-label">{won ? `Adivinaste con ${unlockedSecs} segundo${unlockedSecs!==1?"s":""}` : "No adivinada hoy"}</span>
              <span className={`score-row-val ${won?"blue":"dim"}`}>{won ? `${unlockedSecs}s` : "—"}</span>
            </div>
            {streak > 1 && <div className="streak-pill"><span>🔥</span><span><b>{streak}</b> días seguidos</span></div>}
          </div>
          <div className="countdown-box">
            <span className="countdown-label">Próxima canción en</span>
            <span className="countdown">{pad(countdown.h)}<span>h</span> {pad(countdown.m)}<span>m</span> {pad(countdown.s)}<span>s</span></span>
          </div>
          <button className="history-btn" onClick={() => setShowHistory(true)}>Ver canciones pasadas →</button>
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  HOME SCREEN
// ════════════════════════════════════════════════════════════
function HomeScreen({ onSelect }) {
  const lbSaved = (() => { try { return JSON.parse(localStorage.getItem("gtf_lb")||"{}"); } catch { return {}; } })();
  const songSaved = (() => { try { return JSON.parse(localStorage.getItem("gtf_song")||"{}"); } catch { return {}; } })();
  const todayKey = getTodayKey();
  const lbDone = lbSaved.date === todayKey;
  const songDone = songSaved.date === todayKey;

  return (
    <div className="home">
      <div className="home-hero">
        <div className="nav-dots" style={{marginBottom:"0.5rem"}}>
          <div className="nav-dot"/><div className="nav-dot"/><div className="nav-dot"/>
        </div>
        <h1 className="home-title">Daily Games</h1>
        <p className="home-sub">Una partida por día · Volvé mañana</p>
      </div>
      <div className="home-cards">
        <div className="home-card green" onClick={() => onSelect("lb")}>
          <div className="home-card-icon">🎬</div>
          <div className="home-card-name">Guess the Film</div>
          <div className="home-card-desc">Tres reseñas de Letterboxd. Adiviná la película antes de quedarte sin pistas.</div>
          <div className="home-card-badge">
            <div className="badge-dot"/>
            {lbDone ? "✓ Ya jugaste hoy" : "Jugar ahora"}
          </div>
        </div>
        <div className="home-card blue" onClick={() => onSelect("song")}>
          <div className="home-card-icon">🎵</div>
          <div className="home-card-name">One Song a Day</div>
          <div className="home-card-desc">Escuchá el primer segundo de una canción. Pedí más tiempo si no la reconocés.</div>
          <div className="home-card-badge">
            <div className="badge-dot"/>
            {songDone ? "✓ Ya jugaste hoy" : "Jugar ahora"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  ROOT APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("home"); // "home" | "lb" | "song"

  const today = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" });
  const todayStr = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand" onClick={() => setView("home")}>
            <div className="nav-dots">
              <div className="nav-dot"/><div className="nav-dot"/><div className="nav-dot"/>
            </div>
            <span className="nav-title">Daily Games</span>
          </div>
          <div className="nav-right">
            <span className="nav-date">{todayStr}</span>
            {view !== "home" && (
              <button className="nav-back" onClick={() => setView("home")}>← Inicio</button>
            )}
          </div>
        </nav>

        {view === "home" && <HomeScreen onSelect={setView}/>}
        {view === "lb"   && <LetterboxdGame onBack={() => setView("home")}/>}
        {view === "song" && <SongGame onBack={() => setView("home")}/>}
      </div>
    </>
  );
}
