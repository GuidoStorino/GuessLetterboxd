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

function dayIndexToKey(idx) {
  const d = new Date(2024, 0, 1);
  d.setDate(d.getDate() + idx);
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function dayIndexToLabel(idx) {
  const d = new Date(2024, 0, 1);
  d.setDate(d.getDate() + idx);
  return d.toLocaleDateString("es-AR", { weekday:"short", day:"numeric", month:"short" });
}
function getPastDays(todayIdx, n = 30) {
  const days = [];
  for (let i = 1; i <= n; i++) {
    const idx = todayIdx - i;
    if (idx < 0) break;
    days.push({ dayIdx: idx, key: dayIndexToKey(idx), label: dayIndexToLabel(idx) });
  }
  return days;
}

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
  { id:24, title:"No Country for Old Men", year:2007, director:"Coen Brothers", stars:"★★★★★", reviews:[
    {rank:3,author:"coen_devotee",text:"A film that refuses to give you what you came for and is more devastating for it. The villain doesn't lose. The hero doesn't win. The ending is a dream about death and the movie just stops."},
    {rank:2,author:"anton_forever",text:"Javier Bardem invented a new kind of screen villain — one without motive you can argue with, without psychology you can explain. He's a force of nature wearing a haircut."},
    {rank:1,author:"sheriff_bell",text:"Tommy Lee Jones' final monologue is one of the great closing speeches in American cinema. He describes two dreams and then the film cuts to black. I didn't breathe for thirty seconds."},
  ]},
  { id:25, title:"There Will Be Blood", year:2007, director:"Paul Thomas Anderson", stars:"★★★★★", reviews:[
    {rank:3,author:"pta_oils",text:"An American creation myth told as a horror film. The first fifteen minutes have no dialogue — just a man, a hole in the ground, and the thing he's willing to become to fill it."},
    {rank:2,author:"day_lewis_maniac",text:"Daniel Day-Lewis gives the greatest performance in the history of American cinema. I will hear 'I'm finished!' in my head until I die. He doesn't play a character — he becomes a geological force."},
    {rank:1,author:"milkshake_scene",text:"The bowling alley scene. I will not spoil it. I will just say that when the credits rolled, the entire theater was silent for a full ten seconds before anyone moved."},
  ]},
  { id:26, title:"Eternal Sunshine of the Spotless Mind", year:2004, director:"Michel Gondry", stars:"★★★★★", reviews:[
    {rank:3,author:"gondry_memory",text:"A film about erasing someone you loved — told backwards, then sideways, then from inside the erasure itself. The structure is the emotion. You feel the loss as the memories disappear."},
    {rank:2,author:"jim_kate_duo",text:"Jim Carrey gives the best performance of his career in a film that sneaks up on you completely. By the time you understand what's happening, you're already devastated."},
    {rank:1,author:"clementine_joel",text:"Meet me in Montauk. Those four words destroyed me when I first heard them and they destroy me every single time. The ending is hopeful and hopeless in the same breath."},
  ]},
  { id:27, title:"2001: A Space Odyssey", year:1968, director:"Stanley Kubrick", stars:"★★★★★", reviews:[
    {rank:3,author:"kubrick_monolith",text:"Not a film — a religious experience for atheists. The match cut from bone to spacecraft is the single greatest edit in cinema history. Everything after that is humanity trying to understand itself."},
    {rank:2,author:"hal_9000_fan",text:"HAL 9000 is the most terrifying villain in cinema and he never raises his voice. The calmness is the horror. 'I'm sorry Dave' delivered with absolute serenity is more frightening than any scream."},
    {rank:1,author:"stargate_sequence",text:"I still don't know what the ending means. I've watched it six times. I think that's the point. Kubrick made a film that refuses to be decoded and somehow that refusal is its greatest achievement."},
  ]},
  { id:28, title:"Chinatown", year:1974, director:"Roman Polanski", stars:"★★★★★", reviews:[
    {rank:3,author:"noir_classicist",text:"The greatest neo-noir ever made. A film that uses the conventions of detective fiction to arrive somewhere no detective story has ever gone — pure, structural evil that cannot be defeated."},
    {rank:2,author:"jack_nicholson_nose",text:"Jack Nicholson at the absolute peak of his powers. The nose scene is one of cinema's great moments of physical comedy and menace simultaneously. He holds the whole thing together with effortless cool."},
    {rank:1,author:"forget_it_jake",text:"'Forget it, Jake. It's Chinatown.' The most devastating final line in cinema. The whole film exists to earn those six words and it earns them completely. I've never felt so hopeless watching a movie."},
  ]},
  { id:29, title:"Stalker", year:1979, director:"Andrei Tarkovsky", stars:"★★★★★", reviews:[
    {rank:3,author:"tarkovsky_zone",text:"A three-hour philosophical meditation disguised as a sci-fi film. Nothing explodes. Nobody wins. Three men walk through a forbidden zone toward a room that grants wishes. The journey is the meaning."},
    {rank:2,author:"slow_cinema_fan",text:"Tarkovsky shoots water, grass, abandoned machinery with such reverence that by the end of the film the physical world feels sacred. I don't know how he does it. I don't think I want to know."},
    {rank:1,author:"the_room_ending",text:"The ending destroyed any certainty I had about what I'd watched. The final image is either miraculous or completely mundane. Tarkovsky refuses to tell you which. That refusal is the whole point."},
  ]},
  { id:30, title:"Apocalypse Now", year:1979, director:"Francis Ford Coppola", stars:"★★★★★", reviews:[
    {rank:3,author:"coppola_river",text:"A war film that becomes a fever dream that becomes a philosophical horror show. The journey up the river is the journey into madness — structured exactly like the thing it's depicting."},
    {rank:2,author:"brando_kurtz",text:"Marlon Brando improvised most of his dialogue and it's some of the most hypnotic monologue ever recorded. He sits in shadow and talks about horror and you cannot look away for a single second."},
    {rank:1,author:"the_horror",text:"'The horror. The horror.' Two words that contain a universe of meaning. The film earns them through two and a half hours of mounting dread. The ending isn't a conclusion — it's a collapse."},
  ]},
  { id:31, title:"Yi Yi", year:2000, director:"Edward Yang", stars:"★★★★★", reviews:[
    {rank:3,author:"edward_yang_fan",text:"A three-hour film about one Taiwanese family that contains everything. Birth, death, first love, fading marriage, the cruelty of childhood, the loneliness of old age. Life in a single story."},
    {rank:2,author:"yang_yang_camera",text:"The little boy who photographs the backs of people's heads because 'you can't see what you look like from behind' is one of cinema's great characters. Eight years old and already a philosopher."},
    {rank:1,author:"taiwan_cinema",text:"The final speech made me cry harder than almost anything else I've seen. A child addresses a dead grandmother and accidentally summarizes the entire human condition. Edward Yang was a genius."},
  ]},
  { id:32, title:"The Tree of Life", year:2011, director:"Terrence Malick", stars:"★★★★★", reviews:[
    {rank:3,author:"malick_whisper",text:"A film that asks where God is while watching a child grow up in 1950s Texas — and answers the question with a twenty-minute sequence about the formation of the universe. Completely insane. Completely correct."},
    {rank:2,author:"brad_pitt_dad",text:"Brad Pitt plays a father who loves his sons and cannot stop hurting them. It's the most honest portrait of masculine disappointment I've ever seen. He's never been better or more uncomfortable to watch."},
    {rank:1,author:"cosmic_grief",text:"I went in expecting pretension and came out feeling like I'd had a religious experience. The whispering voiceover, the dinosaurs, the beach at the end — it shouldn't work. It works completely."},
  ]},
  { id:33, title:"Jeanne Dielman", year:1975, director:"Chantal Akerman", stars:"★★★★★", reviews:[
    {rank:3,author:"akerman_kitchen",text:"Three hours and twenty minutes of a woman doing housework. By the end, you understand something about time, repetition, and the violence of domestic routine that no other film has ever captured."},
    {rank:2,author:"feminist_cinema",text:"The film is a radical formal experiment — static camera, real time, minimal cutting — and also the most emotionally devastating thing I've seen. The final act follows from everything before it with terrible logic."},
    {rank:1,author:"real_time_horror",text:"When the deviation happens, it hits like a thunderclap despite being completely quiet. She's been preparing for it for three hours and so have you. The greatest slow-burn in cinema history."},
  ]},
  { id:34, title:"Mulholland Drive", year:2001, director:"David Lynch", stars:"★★★★★", reviews:[
    {rank:3,author:"lynch_dream2",text:"The first half is a dream. The second half is the truth. Once you understand which is which, every image in the first half transforms into something heartbreaking. A film that watches differently every time."},
    {rank:2,author:"naomi_watts2",text:"Naomi Watts plays two characters who are the same person and she makes both completely real. The scene at Club Silencio is the most unsettling thing Lynch has ever done, which is saying everything."},
    {rank:1,author:"diner_monster",text:"The monster behind the diner. I still cannot explain why it affects me the way it does. It's barely on screen. It does almost nothing. And it is the most terrifying thing I have ever seen in a film."},
  ]},
  { id:35, title:"Memories of Murder", year:2003, director:"Bong Joon-ho", stars:"★★★★★", reviews:[
    {rank:3,author:"bong_debut",text:"A true-crime procedural that slowly, painfully dismantles every expectation the genre creates. The incompetence isn't comic — it's tragic. The failure to catch the killer is a national wound."},
    {rank:2,author:"song_kang_ho",text:"Song Kang-ho's performance is the best of his career. He plays a man whose confidence is a performance, and you watch it collapse in real time across the film. The final scene is unbearable."},
    {rank:1,author:"final_look",text:"The last shot — a man looking directly into the camera — is one of cinema's most devastating endings. He's looking at us. At the audience. At the future. He knows what we know."},
  ]},
  { id:36, title:"City of God", year:2002, director:"Fernando Meirelles", stars:"★★★★★", reviews:[
    {rank:3,author:"favela_cinema",text:"Shot with frenetic energy that somehow never becomes chaos — every cut earns itself, every scene builds the world. A film about violence that indicts the systems that create it without ever making a speech."},
    {rank:2,author:"rocket_busca",text:"The structure — told through stories within stories, time folding back on itself — mirrors the way trauma actually works in communities. Brilliant formally and emotionally devastating."},
    {rank:1,author:"li_l_dice",text:"Li'l Dice becoming Li'l Zé is one of cinema's most chilling character transformations. You watch innocence curdle into something monstrous and you understand exactly how it happened. That's the horror."},
  ]},
  { id:37, title:"Synecdoche, New York", year:2008, director:"Charlie Kaufman", stars:"★★★★★", reviews:[
    {rank:3,author:"kaufman_grief",text:"A film about a man who spends his entire life rehearsing life instead of living it. The metaphor — a theater production that becomes indistinguishable from reality — is the saddest thing cinema has ever constructed."},
    {rank:2,author:"philip_seymour",text:"Philip Seymour Hoffman carries two and a half hours of mounting existential dread with complete commitment. It is a performance that asks everything of an actor and receives everything in return."},
    {rank:1,author:"die_alone",text:"I watched it once and cried for an hour afterward. I have not been able to bring myself to watch it again. I think about it constantly. Charlie Kaufman made a film about death that feels like dying."},
  ]},
  { id:38, title:"A Separation", year:2011, director:"Asghar Farhadi", stars:"★★★★★", reviews:[
    {rank:3,author:"farhadi_moral",text:"A film about a divorce that becomes a film about class, religion, and the impossibility of knowing the whole truth of any situation. Every character is right. Every character is wrong. That's the point."},
    {rank:2,author:"iranian_cinema",text:"The courtroom scenes are more tense than any thriller. Nothing explodes. No one is evil. Just ordinary people making decisions under pressure that cascade into tragedy. Farhadi is a moral genius."},
    {rank:1,author:"the_child",text:"The final shot — a child who must choose between her parents — and you never see what she chooses. The film cuts to black. The ambiguity is not a cop-out. It is the whole meaning of the film."},
  ]},
  { id:39, title:"In the Mood for Love", year:2000, director:"Wong Kar-wai", stars:"★★★★★", reviews:[
    {rank:3,author:"wkw_slow_motion",text:"A film about an affair that never happens — told entirely through longing, proximity, and the space between two people who will not let themselves cross. The most romantic film ever made contains almost no romance."},
    {rank:2,author:"maggie_tony",text:"Maggie Cheung's dresses are a character in the film. The slow-motion corridor shots are a love language. The score plays four notes and destroys you every time. There has never been a film like this."},
    {rank:1,author:"angkor_wat",text:"The ending — a man whispering a secret into a hole in a wall in Angkor Wat — made me understand something about grief and time and the things we keep inside us that I had never understood before."},
  ]},
  { id:40, title:"Bicycle Thieves", year:1948, director:"Vittorio De Sica", stars:"★★★★★", reviews:[
    {rank:3,author:"neorealism_fan",text:"A father and son searching for a stolen bicycle for one day in postwar Rome. That's the whole film. By the end it contains the entire weight of poverty, dignity, and what desperation does to good people."},
    {rank:2,author:"de_sica_genius",text:"Shot with non-actors on real streets, it feels more real than any documentary. The father's face in the final scene — the moment his son sees what he's become — is the most devastating image in Italian cinema."},
    {rank:1,author:"the_final_walk",text:"The last scene. Father and son walking into the crowd. The child reaches up and takes his father's hand. I have never recovered. I do not expect to recover. This is what cinema is for."},
  ]},
  { id:41, title:"Pan's Labyrinth", year:2006, director:"Guillermo del Toro", stars:"★★★★½", reviews:[
    {rank:3,author:"fantasy_grief",text:"A fairy tale set against fascist Spain that refuses to keep its two worlds separate. The fantasy is not an escape from reality — it is how a child processes a reality too brutal to survive otherwise."},
    {rank:2,author:"pale_man_scene",text:"The Pale Man sequence is the most purely frightening thing in modern fantasy cinema. Eyes in the palms of hands. A table full of food you must not touch. I covered my eyes and kept watching through my fingers."},
    {rank:1,author:"ofelia_choice",text:"The ending asks whether the magic was real and refuses to answer definitively. Both readings are true. Both are devastating. Del Toro made a film that works as a tragedy and a fairy tale simultaneously."},
  ]},
  { id:42, title:"The Florida Project", year:2017, director:"Sean Baker", stars:"★★★★★", reviews:[
    {rank:3,author:"baker_purple",text:"Filmed in candy colors at the edge of Disney World — a film about children living in poverty who don't know they're in poverty, and the mother who loves them in the only way she knows how."},
    {rank:2,author:"willem_dafoe_manager",text:"Willem Dafoe plays a motel manager with such quiet decency that every scene he's in feels like a small act of grace. He was robbed of the Oscar. It's one of the most generous performances ever filmed."},
    {rank:1,author:"final_run",text:"The final scene changes aspect ratio and I started crying before I understood why. Baker lets the children have one last moment of pure imagination. It is the kindest thing a director has done for a character."},
  ]},
  { id:43, title:"Portrait of a Lady on Fire", year:2019, director:"Céline Sciamma", stars:"★★★★★", reviews:[
    {rank:3,author:"sciamma_gaze",text:"A film about looking — about who gets to look, who gets to be seen, and what it means when looking becomes love. Shot entirely from the perspective of one woman watching another. Revolutionary in form and feeling."},
    {rank:2,author:"noemie_adele_duo",text:"Noémie Merlant and Adèle Haenel create a love story through glances and proximity and the charged silence between two people who know they have almost no time. The chemistry is electric."},
    {rank:1,author:"vivaldi_ending",text:"The Vivaldi scene at the end. I will not describe it. I will say that it is the most devastating use of a reaction shot in cinema history and that Adèle Haenel's face contains everything the film has built."},
  ]},
  { id:44, title:"Werckmeister Harmonies", year:2000, director:"Béla Tarr", stars:"★★★★★", reviews:[
    {rank:3,author:"bela_tarr_fan",text:"Shot in long, slow takes that last minutes at a time — a film about the arrival of a mysterious circus in a Hungarian town that becomes a meditation on order, chaos, and the collapse of everything good."},
    {rank:2,author:"whale_scene",text:"The scene where a young man walks through the interior of a whale carcass, alone, is one of the most beautiful and inexplicable images I've seen in cinema. I have thought about it every week for five years."},
    {rank:1,author:"opening_dance",text:"The film opens with a drunk man directing two other drunks to re-enact the solar system. It goes on for seven minutes. I was completely hypnotized. I knew immediately I was watching something I would never forget."},
  ]},
  { id:45, title:"Certified Copy", year:2010, director:"Abbas Kiarostami", stars:"★★★★½", reviews:[
    {rank:3,author:"kiarostami_copy",text:"Two strangers who may or may not have been a couple for fifteen years walk through a Tuscan village. The film refuses to tell you which reality is real. Both are. Neither is. That ambiguity is the whole point."},
    {rank:2,author:"juliette_binoche",text:"Juliette Binoche gives one of the most technically demanding performances I've seen — she has to be a different person depending on which version of events is true, and she does it in the same scene simultaneously."},
    {rank:1,author:"mirror_scene",text:"The scene in the hotel mirror — where she puts on earrings and transforms — is the pivot point of the film. Before it: one story. After it: another. The movie is about that transformation and what causes it."},
  ]},
  { id:46, title:"Portrait of Jason", year:1967, director:"Shirley Clarke", stars:"★★★★★", reviews:[
    {rank:3,author:"documentary_truth",text:"A single person talks to a camera for twelve hours, edited to eighty-one minutes. The result is the most intimate portrait of a human being ever filmed. You can't stop watching and you feel guilty for watching."},
    {rank:2,author:"jason_holliday",text:"Jason Holliday performs himself so completely that you can never be sure where the performance ends and the person begins. That confusion is the film's subject and its method simultaneously."},
    {rank:1,author:"shirley_clarke",text:"The moment when Clarke keeps the camera rolling past the point of comfort — when the mask starts to crack — is one of documentary cinema's great ethical moments. She knew exactly what she was doing."},
  ]},
  { id:47, title:"Tangerines", year:2013, director:"Zaza Urushadze", stars:"★★★★½", reviews:[
    {rank:3,author:"estonian_war",text:"Two enemies — one on each side of a war — both recovering in the same house, tended by a man who refuses to acknowledge the war as a reason to abandon either of them. Quiet, devastating, necessary."},
    {rank:2,author:"lembit_ulfsak",text:"The old man at the center of the film is played with such stillness and such stubborn decency that every scene he's in becomes a lesson in how to live. The performance looks effortless and is not."},
    {rank:1,author:"tangerine_harvest",text:"The tangerines. Why tangerines. The answer is that beauty and the absurd and the tragic all coexist in the same world and sometimes the same harvest. The ending broke me gently."},
  ]},
  { id:48, title:"A Ghost Story", year:2017, director:"David Lowery", stars:"★★★★½", reviews:[
    {rank:3,author:"sheet_ghost",text:"A man dies. He comes back as a ghost wearing a white sheet with eye holes. The film is completely sincere about this. It works. I don't know how it works. It just does, completely and devastatingly."},
    {rank:2,author:"rooney_pie_scene",text:"Rooney Mara eats a pie alone on the kitchen floor for five minutes. Static camera. No dialogue. It is the most effective portrayal of grief I have ever seen in a film. Watching it felt intrusive."},
    {rank:1,author:"cosmic_patience",text:"The film spans hundreds of years in ninety minutes and never feels rushed. Time is the subject and the form. The ghost waits and waits and the waiting is the whole meaning of the film."},
  ]},
  { id:49, title:"Capernaum", year:2018, director:"Nadine Labaki", stars:"★★★★½", reviews:[
    {rank:3,author:"labaki_beirut",text:"A twelve-year-old sues his parents for the crime of having him. Shot with non-professional actors in real Lebanese slums, it feels like a document as much as a drama. The child carries the film completely."},
    {rank:2,author:"zain_performance",text:"Zain Al Rafeea had never acted before this film. His face is the film. Every emotion — rage, tenderness, exhaustion, hope — passes across it with complete authenticity. It is not a performance. It is a life."},
    {rank:1,author:"the_statement",text:"'I want grown-ups who brought unwanted children into the world to be punished.' Delivered by a child in a courtroom. The most furious and heartbreaking line of dialogue I've encountered."},
  ]},
  { id:50, title:"The Act of Killing", year:2012, director:"Joshua Oppenheimer", stars:"★★★★★", reviews:[
    {rank:3,author:"oppenheimer_doc",text:"A documentary where real perpetrators of mass killings re-enact their crimes as movie genres. The horror is that they're proud. The deeper horror is watching one of them slowly understand what he did."},
    {rank:2,author:"anwar_congo",text:"Anwar Congo is one of cinema's most disturbing figures — not a monster, which would be easier, but a man, which is worse. Watching him dance on the rooftop where he killed people is unwatchable and essential."},
    {rank:1,author:"gagging_scene",text:"The final scene — a man physically overcome on the same rooftop — is one of documentary cinema's most extraordinary moments. You watch guilt arrive in a body that has held it off for fifty years."},
  ]},
  { id:51, title:"Leviathan", year:2014, director:"Andrey Zvyagintsev", stars:"★★★★½", reviews:[
    {rank:3,author:"zvyagintsev_russia",text:"A Russian man loses his house, his wife, and his freedom to a corrupt local official. The title is not metaphorical — the film sees the state as the biblical monster, devouring everything decent in its path."},
    {rank:2,author:"job_allegory",text:"The Job parallel is so precise it's almost didactic and yet the film never feels like a lecture. It feels like living inside a system designed to crush you and watching every appeal to justice fail."},
    {rank:1,author:"whale_bones_beach",text:"The whale skeleton on the beach. One image that contains the entire film's meaning. Beauty and destruction coexisting without comment. Russia has never looked more gorgeous or more doomed."},
  ]},
  { id:52, title:"The White Ribbon", year:2009, director:"Michael Haneke", stars:"★★★★½", reviews:[
    {rank:3,author:"haneke_village",text:"Shot in black and white, set in a German village just before the First World War, about children doing terrible things. The horror is in what isn't shown. The horror is in what's implied. Haneke is merciless."},
    {rank:2,author:"haneke_method",text:"Michael Haneke refuses to explain. Who did it? Why? He won't tell you. The ambiguity is the point — these are the children who will become the generation that starts the next war. You don't need to understand. You need to feel it."},
    {rank:1,author:"white_ribbon_symbol",text:"The white ribbon of the title — tied on children as a reminder of innocence and purity — becomes the most sinister symbol in the film. Virtue weaponized as control. The whole of 20th century horror in one image."},
  ]},
  { id:53, title:"Prisoners", year:2013, director:"Denis Villeneuve", stars:"★★★★½", reviews:[
    {rank:3,author:"villeneuve_moral",text:"A thriller that asks what a good man is capable of when his child disappears — and doesn't flinch from the answer. Every character makes a defensible choice. Every choice leads somewhere terrible."},
    {rank:2,author:"gyllenhaal_detective",text:"Jake Gyllenhaal's eye twitch, the spiral notebook, the obsessive case board — he builds a character from pure behavioral detail. The detective is barely in the film and completely dominates it."},
    {rank:1,author:"maze_ending",text:"The final image. A sound in the dark. The film cuts to black before you can confirm what you heard. I sat in the theater for five minutes after the credits. I still don't know if I was right."},
  ]},
  { id:54, title:"Children of Men", year:2006, director:"Alfonso Cuarón", stars:"★★★★★", reviews:[
    {rank:3,author:"cuaron_hope",text:"A world where no children have been born for eighteen years. The camera moves through it without cuts, without mercy, without sentimentality — and then finds the one thing that can stop a war in its tracks."},
    {rank:2,author:"clive_owen_carries",text:"Clive Owen holds the film together through sheer exhausted decency. He doesn't want to be a hero. He just keeps moving forward. The film is about what happens when the most ordinary human decency becomes a revolutionary act."},
    {rank:1,author:"long_take_war",text:"The battle sequence — one continuous take through active combat — is the most technically extraordinary thing I've seen in a cinema. And then, in the middle of it, everything stops. The reason it stops made me cry."},
  ]},
  { id:55, title:"Blue Is the Warmest Color", year:2013, director:"Abdellatif Kechiche", stars:"★★★★", reviews:[
    {rank:3,author:"kechiche_face",text:"A three-hour close-up of a young woman's face as she falls in love and loses it. The camera never stops watching. By the end, you know this face better than any face in cinema."},
    {rank:2,author:"adele_exarchopoulos",text:"Adèle Exarchopoulos was nineteen and had never had a major role. Her performance is one of the most raw and unguarded things captured on film. The crying scene alone should have won every award."},
    {rank:1,author:"blue_ending",text:"The final scene — walking away in a crowd of people wearing blue — is the loneliest image in the film. She's surrounded by the color she associates with the person she lost. Perfect and cruel."},
  ]},
  { id:56, title:"Mid90s", year:2018, director:"Jonah Hill", stars:"★★★★", reviews:[
    {rank:3,author:"jonah_debut",text:"A debut film so confident and so specific it's disorienting. Shot on 16mm in a 4:3 ratio, it captures something true about being thirteen and finding the first people who make you feel like yourself."},
    {rank:2,author:"stevie_skate",text:"The skating sequences are pure joy. The home sequences are pure dread. The film holds both without resolving the tension between them — which is exactly what being that age feels like."},
    {rank:1,author:"the_talk_scene",text:"The older brother talks to the younger brother at the end. It should be a cliché. It isn't. It's one of the most honest conversations between siblings I've seen in a film, earned by everything before it."},
  ]},
  { id:57, title:"Burning", year:2018, director:"Lee Chang-dong", stars:"★★★★½", reviews:[
    {rank:3,author:"lee_chang2",text:"A mystery that refuses to resolve. A thriller with no catharsis. A love triangle that becomes something no genre can contain. Two and a half hours of sustained unease that ends with one of cinema's great ambiguous acts."},
    {rank:2,author:"steven_yeun2",text:"Steven Yeun plays menace as calm — a man who may have done something terrible and radiates the absolute serenity of someone who has never needed to justify himself to anyone. It's the scariest performance in recent memory."},
    {rank:1,author:"sunset_dance2",text:"She dances at sunset with her eyes closed while he watches with that smile. The most beautiful and sinister scene of the decade. I still see it when I close my eyes."},
  ]},
  { id:58, title:"Brokeback Mountain", year:2005, director:"Ang Lee", stars:"★★★★★", reviews:[
    {rank:3,author:"ang_lee_mountain",text:"A love story told almost entirely in silences, landscapes, and the space between two men who cannot say what they mean. The American West has never looked more beautiful or felt more like a prison."},
    {rank:2,author:"heath_ledger_mumble",text:"Heath Ledger turned repression into a physical performance — you can see the emotion trapped behind his jaw, behind his posture, behind everything he refuses to let himself say. One of cinema's greatest performances."},
    {rank:1,author:"shirt_scene",text:"The shirt in the closet. I knew it was coming. I had read the story. I cried anyway. The image is so simple and so complete that it contains the entire tragedy of the film in a single object."},
  ]},
  { id:59, title:"Uncut Gems", year:2019, director:"Safdie Brothers", stars:"★★★★½", reviews:[
    {rank:3,author:"safdie_anxiety",text:"Two hours of the most sustained anxiety ever put on screen. Every scene escalates, every conversation overlaps, every bet raises the stakes higher. The film is designed to prevent you from breathing."},
    {rank:2,author:"adam_sandler_bet",text:"Adam Sandler gives the best performance of his career — a man who genuinely believes the next bet will fix everything, and who keeps losing, and who cannot stop. It's a portrait of addiction that never asks for sympathy."},
    {rank:1,author:"the_ending_gems",text:"I saw it in a theater. When it ended, half the audience laughed from pure nervous release. The other half sat in silence. I was in the second group. The ending is earned and correct and I hated it completely."},
  ]},
  { id:60, title:"The Irishman", year:2019, director:"Martin Scorsese", stars:"★★★★½", reviews:[
    {rank:3,author:"scorsese_time",text:"A three-and-a-half-hour gangster film that is secretly about old age, regret, and the impossibility of making amends for a life lived in service of violence. The de-aging technology is irrelevant. The sadness is everything."},
    {rank:2,author:"de_niro_pacino_pesci",text:"Three legends in the same film, all at the peak of their late-career powers. But it's Joe Pesci — barely speaking, completely still — who steals every scene. Restraint as the ultimate performance."},
    {rank:1,author:"door_left_open",text:"The final image: a door left slightly ajar. The man who spent his life closing doors, eliminating people, burning evidence, asks for this one door to be left open. It is the saddest image in Scorsese's filmography."},
  ]},
  { id:61, title:"Aftersun", year:2022, director:"Charlotte Wells", stars:"★★★★★", reviews:[
    {rank:3,author:"wells_memory2",text:"A daughter tries to reconstruct who her father was from the footage she has of a holiday they took together when she was eleven. The horror is gradual. The grief is retroactive. The filmmaking is extraordinary."},
    {rank:2,author:"paul_mescal2",text:"Paul Mescal plays a young father who is drowning and cannot tell his daughter. Every small choice — a deflection, a too-long hug, a moment of joy that cracks into something else — lands with devastating precision."},
    {rank:1,author:"under_pressure2",text:"The Under Pressure sequence. I will not describe it. The context makes it one of the most painful images I have ever seen. Charlotte Wells understood exactly what she was doing. I was not prepared."},
  ]},
  { id:62, title:"Nomadland", year:2020, director:"Chloé Zhao", stars:"★★★★½", reviews:[
    {rank:3,author:"zhao_america",text:"A film about people who live in vans and follow seasonal work across the American West — shot with such tenderness and respect that it never condescends, never aestheticizes poverty, and breaks your heart gently."},
    {rank:2,author:"frances_mcdormand_van",text:"Frances McDormand disappears into the landscape so completely that sometimes you forget you're watching an actress. The film needed someone who could carry immense grief lightly. She does it better than anyone alive."},
    {rank:1,author:"rocks_and_sky",text:"The ending is a woman driving into a landscape so vast and indifferent it should feel hopeless. It doesn't. It feels like freedom. Zhao makes you understand, in one image, exactly what that choice costs and what it gives."},
  ]},
  { id:63, title:"First Cow", year:2019, director:"Kelly Reichardt", stars:"★★★★½", reviews:[
    {rank:3,author:"reichardt_frontier",text:"Two men in the Oregon frontier make illegal cookies using a rich man's cow and try to build a small life inside a system designed to crush small lives. The most gentle and devastating film about capitalism ever made."},
    {rank:2,author:"john_magaro_john",text:"The friendship between the two men is one of cinema's great platonic love stories — tender, specific, funny, and built on the mutual recognition of two outsiders who understand each other immediately."},
    {rank:1,author:"the_first_scene",text:"The film opens at the end — we see what will happen before we understand who these people are. When you reach that ending having known these characters, the image becomes unbearable. Reichardt planned it perfectly."},
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
  { id:1,  title:"Do I Wanna Know?",               artist:"Arctic Monkeys",    year:2013, audioUrl:"/songs/do-i-wanna-know.mp3"          },
{ id:2, title:"Acquiesce", artist:"oasis", year:null, audioUrl:"/songs/acquiesce.mp3" },
{ id:3, title:"All Around the World", artist:"Oasis", year:null, audioUrl:"/songs/allaroundtheworld.mp3" },
{ id:4, title:"All I Want is You", artist:"U2", year:null, audioUrl:"/songs/alliwantisyou.mp3" },
{ id:5, title:"Bang and Blame", artist:"REM", year:null, audioUrl:"/songs/bangandblame.mp3" },
{ id:6, title:"Bar Italia", artist:"Pulp", year:null, audioUrl:"/songs/baritalia.mp3" },
{ id:7, title:"Beetlebum", artist:"Blur", year:null, audioUrl:"/songs/beetlebum.mp3" },
{ id:8, title:"Bigmouth Strikes Again", artist:"The Smiths", year:null, audioUrl:"/songs/bigmouthstrikesagain.mp3" },
{ id:9, title:"Bittersweet Symphony", artist:"The Verve", year:null, audioUrl:"/songs/bittersweetsymphony.mp3" },
{ id:10, title:"Black Hole Sun", artist:"Soundgarden", year:null, audioUrl:"/songs/blackholesun.mp3" },
{ id:11, title:"Blue Monday", artist:"New Order", year:null, audioUrl:"/songs/bluemonday.mp3" },
{ id:12, title:"Blue Pacific Ocean", artist:"The Verve", year:null, audioUrl:"/songs/bluepacificocean.mp3" },
{ id:13, title:"Charmless Man", artist:"Blur", year:null, audioUrl:"/songs/charmlessman.mp3" },
{ id:14, title:"China Girl", artist:"David Bowie", year:null, audioUrl:"/songs/chinagirl.mp3" },
{ id:15, title:"Common People", artist:"Pulp", year:null, audioUrl:"/songs/commonpeople.mp3" },
{ id:16, title:"Dakota", artist:"Stereophonics", year:null, audioUrl:"/songs/dakota.mp3" },
{ id:17, title:"Disorder", artist:"Joy Division", year:null, audioUrl:"/songs/disorder.mp3" },
{ id:18, title:"Dreams", artist:"The Cranberries", year:null, audioUrl:"/songs/dreams.mp3" },
{ id:19, title:"Dyou Know What I Mean", artist:"Oasis", year:null, audioUrl:"/songs/dyouknowwhatimean.mp3" },
{ id:20, title:"eBow The Letter", artist:"REM", year:null, audioUrl:"/songs/ebowtheletter.mp3" },
{ id:21, title:"Enjoy The Silence", artist:"Depeche Mode", year:null, audioUrl:"/songs/enjoythesilence.mp3" },
{ id:22, title:"Everlong", artist:"Foo Fighters", year:null, audioUrl:"/songs/everlong.mp3" },
{ id:23, title:"Everyday is Like Sunday", artist:"Morrissey", year:null, audioUrl:"/songs/everydayislikesunday.mp3" },
{ id:24, title:"Eyes Without a Face", artist:"Billy Idol", year:null, audioUrl:"/songs/eyeswithoutaface.mp3" },
{ id:25, title:"Fluorescent Adolescent", artist:"Arctic Monkeys", year:null, audioUrl:"/songs/fluorescentadolescent.mp3" },
{ id:26, title:"Fools Gold", artist:"The Stone Roses", year:null, audioUrl:"/songs/foolsgold.mp3" },
{ id:27, title:"franklymrshankly", artist:"the smiths", year:null, audioUrl:"/songs/franklymrshankly.mp3" },
{ id:28, title:"Girls And Boys", artist:"Blur", year:null, audioUrl:"/songs/girlsandboys.mp3" },
{ id:29, title:"Go Your Own Way", artist:"Fleetwood Mac", year:null, audioUrl:"/songs/goyourownway.mp3" },
{ id:30, title:"Hard to Explain", artist:"The Strokes", year:null, audioUrl:"/songs/hardtoexplain.mp3" },
{ id:31, title:"Help the Aged", artist:"Pulp", year:null, audioUrl:"/songs/helptheaged.mp3" },
{ id:32, title:"Heroes", artist:"David Bowie", year:null, audioUrl:"/songs/heroes.mp3" },
{ id:33, title:"High and Dry", artist:"Radiohead", year:null, audioUrl:"/songs/highanddry.mp3" },
{ id:34, title:"How Soon Is Now", artist:"The Smiths", year:null, audioUrl:"/songs/howsoonisnow.mp3" },
{ id:35, title:"If God Will Send His Angels", artist:"U2", year:null, audioUrl:"/songs/ifgodwillsendhisangels.mp3" },
{ id:36, title:"Keep the Dream Alive", artist:"Oasis", year:null, audioUrl:"/songs/keepthedreamalive.mp3" },
{ id:37, title:"Let It Happen", artist:"Tame Impala", year:null, audioUrl:"/songs/letithappen.mp3" },
{ id:38, title:"Like a Friend", artist:"Pulp", year:null, audioUrl:"/songs/likeafriend.mp3" },
{ id:39, title:"Little by Little", artist:"Oasis", year:null, audioUrl:"/songs/littlebylittle.mp3" },
{ id:40, title:"Lonely Boy", artist:"The Black Keys", year:null, audioUrl:"/songs/lonelyboy.mp3" },
{ id:41, title:"Losing My Religion", artist:"R.E.M.", year:null, audioUrl:"/songs/losingmyreligion.mp3" },
{ id:42, title:"Love Will Tear Us Apart", artist:"Joy Division", year:null, audioUrl:"/songs/lovewilltearusapart.mp3" },
{ id:43, title:"Lucky Man", artist:"The Verve", year:null, audioUrl:"/songs/luckyman.mp3" },
{ id:44, title:"Mardy Bum", artist:"Arctic Monkeys", year:null, audioUrl:"/songs/mardybum.mp3" },
{ id:45, title:"Morning Glory", artist:"Oasis", year:null, audioUrl:"/songs/morningglory.mp3" },
{ id:46, title:"On Your Own", artist:"The Verve", year:null, audioUrl:"/songs/onyourown.mp3" },
{ id:47, title:"Paint It Black", artist:"The Rolling Stones", year:null, audioUrl:"/songs/paintitblack.mp3" },
{ id:48, title:"Paradise Circus", artist:"Massive Attack", year:null, audioUrl:"/songs/paradisecircus.mp3" },
{ id:49, title:"Parklife", artist:"Blur", year:null, audioUrl:"/songs/parklife.mp3" },
{ id:50, title:"Pictures of You", artist:"The Cure", year:null, audioUrl:"/songs/picturesofyou.mp3" },
{ id:51, title:"Please Please Please Let Me Get What I Want", artist:"The Smiths", year:null, audioUrl:"/songs/pleasepleasepleaseletmegetwhatIwant.mp3" },
{ id:52, title:"Reptilia", artist:"The Strokes", year:null, audioUrl:"/songs/reptilia.mp3" },
{ id:53, title:"Re-Wired", artist:"Kasabian", year:null, audioUrl:"/songs/rewired.mp3" },
{ id:54, title:"Rockin' Chair", artist:"Oasis", year:null, audioUrl:"/songs/rockinchair.mp3" },
{ id:55, title:"She Moves in Her Own Way", artist:"The Kooks", year:null, audioUrl:"/songs/shemovesinherownway.mp3" },
{ id:56, title:"Shoot You Down", artist:"The Stone Roses", year:null, audioUrl:"/songs/shootyoudown.mp3" },
{ id:57, title:"Sleep Like a Baby Tonight", artist:"U2", year:null, audioUrl:"/songs/sleeplikeababytonight.mp3" },
{ id:58, title:"Slide Away", artist:"Oasis", year:null, audioUrl:"/songs/slideaway.mp3" },
{ id:59, title:"Somebody Told Me", artist:"The Killers", year:null, audioUrl:"/songs/somebodytoldme.mp3" },
{ id:60, title:"Some Might Say", artist:"Oasis", year:null, audioUrl:"/songs/somemightsay.mp3" },
{ id:61, title:"Sometimes You Can't Make It on Your Own", artist:"U2", year:null, audioUrl:"/songs/sometimesyoucantmakeitonyourown.mp3" },
{ id:62, title:"Song 2", artist:"Blur", year:null, audioUrl:"/songs/song2.mp3" },
{ id:63, title:"Sonnet", artist:"The Verve", year:null, audioUrl:"/songs/sonnet.mp3" },
{ id:64, title:"Street Fighting Man", artist:"The Rolling Stones", year:null, audioUrl:"/songs/streetfightingman.mp3" },
{ id:65, title:"Suedehead", artist:"Morrissey", year:null, audioUrl:"/songs/suedehead.mp3" },
{ id:66, title:"Supersonic", artist:"Oasis", year:null, audioUrl:"/songs/supersonic.mp3" },
{ id:67, title:"Take on Me", artist:"a-ha", year:null, audioUrl:"/songs/takeonme.mp3" },
{ id:68, title:"Talk Tonight", artist:"Oasis", year:null, audioUrl:"/songs/talktonight.mp3" },
{ id:69, title:"Tender", artist:"Blur", year:null, audioUrl:"/songs/tender.mp3" },
{ id:70, title:"The Hindu Times", artist:"Oasis", year:null, audioUrl:"/songs/thehindutimes.mp3" },
{ id:71, title:"The Killing Moon", artist:"Echo & The Bunnymen", year:null, audioUrl:"/songs/thekillingmoon.mp3" },
{ id:72, title:"The Mighty I", artist:"Noel Gallagher", year:null, audioUrl:"/songs/themightyi.mp3" },
{ id:73, title:"The Queen Is Dead", artist:"The Smiths", year:null, audioUrl:"/songs/thequeenisdead.mp3" },
{ id:74, title:"There She Goes", artist:"The La's", year:null, audioUrl:"/songs/thereshegoes.mp3" },
{ id:75, title:"These Days", artist:"Nico", year:null, audioUrl:"/songs/thesedays.mp3" },
{ id:76, title:"The Wild Ones", artist:"Suede", year:null, audioUrl:"/songs/thewildones.mp3" },
{ id:77, title:"This Charming Man", artist:"The Smiths", year:null, audioUrl:"/songs/thischarmingman.mp3" },
{ id:78, title:"This Is Hardcore", artist:"Pulp", year:null, audioUrl:"/songs/thisishardcore.mp3" },
{ id:79, title:"Tonite", artist:"Jarvis Cocker", year:null, audioUrl:"/songs/tonite.mp3" },
{ id:80, title:"A Town Called Malice", artist:"The Jam", year:null, audioUrl:"/songs/towncalledmalice.mp3" },
{ id:81, title:"Wet Sand", artist:"Red Hot Chili Peppers", year:null, audioUrl:"/songs/wetsand.mp3" },
{ id:82, title:"Whatever", artist:"Oasis", year:null, audioUrl:"/songs/whatever.mp3" },
{ id:83, title:"What's Up", artist:"4 Non Blondes", year:null, audioUrl:"/songs/whatsup.mp3" },
{ id:84, title:"When the Sun Goes Down", artist:"Arctic Monkeys", year:null, audioUrl:"/songs/whenthesungoesdown.mp3" },
{ id:85, title:"Wicked Game", artist:"Chris Isaak", year:null, audioUrl:"/songs/wickedgame.mp3" },
{ id:86, title:"With or Without You", artist:"U2", year:null, audioUrl:"/songs/withorwithoutyou.mp3" },
{ id:87, title:"Karma Police", artist:"Radiohead", year:null, audioUrl:"/songs/Karma Police.mp3" },
{ id:88, title:"Champagne Supernova", artist:"Oasis", year:null, audioUrl:"/songs/Champagne Supernova.mp3" },
{ id:89, title:"Come As You Are", artist:"Nirvana", year:null, audioUrl:"/songs/Come As You Are.mp3" },
{ id:90, title:"Don't Look Back in Anger", artist:"Oasis", year:null, audioUrl:"/songs/Don't Look Back in Anger.mp3" },
{ id:91, title:"Ready To Start", artist:"Arcade Fire", year:null, audioUrl:"/songs/ready-to-start.mp3" },
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
  .history-pts.pending-col{color:var(--border2)}
  .archive-playable{cursor:pointer}
  .archive-playable:hover{border-color:var(--border2);background:var(--surface2)}
  .archive-btn{background:none;border:none;padding:0.15rem 0;font-size:0.68rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;text-decoration:underline;text-underline-offset:3px;cursor:pointer;text-align:left;margin-top:0.35rem}
  .home-card.green .archive-btn{color:var(--green-dark)}
  .home-card.blue .archive-btn{color:var(--blue-dark)}
  .archive-btn:hover{opacity:0.75}


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

function LetterboxdGame({ onBack, dayIdx: propDayIdx }) {
  const todayIdx = getDayIndex();
  const dayIdx = propDayIdx ?? todayIdx;
  const isToday = dayIdx === todayIdx;
  const gameKey = dayIndexToKey(dayIdx);
  const movie = MOVIES[((dayIdx % MOVIES.length) + MOVIES.length) % MOVIES.length];

  const storageKey = isToday ? "gtf_lb" : `gtf_lb_${gameKey}`;
  const saved = (() => { try { return JSON.parse(localStorage.getItem(storageKey)||"{}"); } catch { return {}; } })();
  const alreadyPlayed = saved.played === true;

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
    localStorage.setItem(storageKey, JSON.stringify({ played:true, score:sc, hintLevel:hl, dayIdx }));
    if (isToday) {
      const y = (() => { const d=new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; })();
      const newStreak = saved.streak && saved.date ? (saved.streak ?? 0) + 1 : 1;
      setStreak(newStreak);
      localStorage.setItem("gtf_lb", JSON.stringify({ played:true, score:sc, hintLevel:hl, dayIdx, streak:newStreak }));
    }
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
          <h2 className="tomorrow-title green">
            {score > 0
              ? (isToday ? <>¡Adivinaste la película del día!</> : <>¡Adivinaste!</>)
              : (isToday ? <>No pasa nada,<br/><em>volvé mañana</em></> : <>Mala suerte</>)}
          </h2>
          <div className="result-card">
            <div>
              <p className="t-label">{isToday ? "Película de hoy" : `Del ${dayIndexToLabel(dayIdx)}`}</p>
              <p className="t-main-title">{movie.title}</p>
              <p className="t-meta">{movie.year} · {movie.director} · {movie.stars}</p>
            </div>
            <div className="divider"/>
            <div className="score-row">
              <span className="score-row-label">{score > 0 ? `Con la ${hintUsed}` : "Sin puntos"}</span>
              <span className="score-row-val green">{score ?? 0} pts</span>
            </div>
            {isToday && streak > 1 && <div className="streak-pill"><span>🔥</span><span><b>{streak}</b> días seguidos</span></div>}
          </div>
          {isToday
            ? <div className="countdown-box">
                <span className="countdown-label">Próxima película en</span>
                <span className="countdown">{pad(countdown.h)}<span>h</span> {pad(countdown.m)}<span>m</span> {pad(countdown.s)}<span>s</span></span>
              </div>
            : <button className="btn-ghost" onClick={onBack} style={{marginTop:"0.5rem"}}>← Volver al archivo</button>
          }
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

function SongGame({ onBack, dayIdx: propDayIdx }) {
  const todayIdx = getDayIndex();
  const dayIdx = propDayIdx ?? todayIdx;
  const isToday = dayIdx === todayIdx;
  const gameKey = dayIndexToKey(dayIdx);
  const song = SONGS[((dayIdx + 7) % SONGS.length + SONGS.length) % SONGS.length];

  const storageKey = isToday ? "gtf_song" : `gtf_song_${gameKey}`;
  const saved = (() => { try { return JSON.parse(localStorage.getItem(storageKey)||"{}"); } catch { return {}; } })();
  const alreadyPlayed = saved.played === true;

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
    localStorage.setItem(storageKey, JSON.stringify({ played:true, won:w, unlockedSecs:secs, dayIdx }));
    if (isToday) {
      const newStreak = (saved.streak ?? 0) + 1;
      setStreak(newStreak);
      localStorage.setItem("gtf_song", JSON.stringify({ played:true, won:w, unlockedSecs:secs, dayIdx, streak:newStreak }));
    }
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

        </div>
      )}

      {screen === "done" && (
        <div className="tomorrow">
          <div className="tomorrow-icon">{won ? "🎵" : "😔"}</div>
          <h2 className="tomorrow-title blue">
            {won
              ? (isToday ? <>¡Adivinaste la canción del día!</> : <>¡Adivinaste!</>)
              : (isToday ? <>No pasa nada,<br/><em>volvé mañana</em></> : <>Mala suerte</>)}
          </h2>
          <div className="result-card">
            <div>
              <p className="t-label">{isToday ? "Canción de hoy" : `Del ${dayIndexToLabel(dayIdx)}`}</p>
              <p className="t-main-title">{song.title}</p>
              <p className="t-meta">{song.artist} · {song.year}</p>
            </div>
            <div className="divider"/>
            <div className="score-row">
              <span className="score-row-label">{won ? `Adivinaste con ${unlockedSecs}s` : "No adivinada"}</span>
              <span className={`score-row-val ${won?"blue":"dim"}`}>{won ? `${unlockedSecs}s` : "—"}</span>
            </div>
            {isToday && streak > 1 && <div className="streak-pill"><span>🔥</span><span><b>{streak}</b> días seguidos</span></div>}
          </div>
          {isToday
            ? <div className="countdown-box">
                <span className="countdown-label">Próxima canción en</span>
                <span className="countdown">{pad(countdown.h)}<span>h</span> {pad(countdown.m)}<span>m</span> {pad(countdown.s)}<span>s</span></span>
              </div>
            : <button className="btn-ghost" onClick={onBack} style={{marginTop:"0.5rem"}}>← Volver al archivo</button>
          }
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════
//  ARCHIVE SCREEN
// ════════════════════════════════════════════════════════════
function ArchiveScreen({ game, onSelect, onBack }) {
  const todayIdx = getDayIndex();
  const days = getPastDays(todayIdx, 30);
  const prefix = game === "lb" ? "gtf_lb" : "gtf_song";
  const accent = game === "lb" ? "green" : "blue";
  const icon = game === "lb" ? "🎬" : "🎵";
  const title = game === "lb" ? "Guess the Film" : "One Song a Day";

  function getState(key) {
    try {
      const s = JSON.parse(localStorage.getItem(`${prefix}_${key}`) || "null");
      if (!s || !s.played) return "pending";
      return game === "lb" ? (s.score > 0 ? "won" : "lost") : (s.won ? "won" : "lost");
    } catch { return "pending"; }
  }

  function getScore(key) {
    try {
      const s = JSON.parse(localStorage.getItem(`${prefix}_${key}`) || "null");
      if (!s || !s.played) return null;
      return game === "lb" ? `${s.score}pts` : (s.won ? `${s.unlockedSecs}s` : "—");
    } catch { return null; }
  }

  return (
    <div className="main">
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.25rem"}}>
        <span style={{fontSize:"1.2rem"}}>{icon}</span>
        <div>
          <p className="header-label">Archivo · últimos 30 días</p>
          <h1 className="header-title">{title}</h1>
        </div>
      </div>
      <div className="history-grid">
        {days.map(({dayIdx, key, label}) => {
          const state = getState(key);
          const score = getScore(key);
          const item = game === "lb"
            ? MOVIES[((dayIdx % MOVIES.length) + MOVIES.length) % MOVIES.length]
            : SONGS[((dayIdx + 7) % SONGS.length + SONGS.length) % SONGS.length];
          return (
            <div key={key}
              className={`history-row${state === "pending" ? " archive-playable" : ""}`}
              onClick={() => state === "pending" && onSelect(dayIdx)}>
              <span className="history-date">{label}</span>
              <div className="history-info">
                {state === "pending"
                  ? <div className="history-title" style={{color:`var(--${accent})`}}>Jugar →</div>
                  : <>
                      <div className="history-title">{item.title}</div>
                      <div className="history-sub">{game === "lb" ? item.director : item.artist}</div>
                    </>
                }
              </div>
              <span className={`history-pts ${state === "won" ? accent : state === "lost" ? "dim" : "pending-col"}`}>
                {state === "pending" ? "·" : state === "won" ? `✓ ${score}` : "✗"}
              </span>
            </div>
          );
        })}
      </div>
      <button className="btn-ghost" onClick={onBack} style={{alignSelf:"center"}}>← Volver</button>
    </div>
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
          <button className="archive-btn" onClick={e=>{e.stopPropagation();onSelect("lb-archive");}}>Ver días pasados →</button>
        </div>
        <div className="home-card blue" onClick={() => onSelect("song")}>
          <div className="home-card-icon">🎵</div>
          <div className="home-card-name">One Song a Day</div>
          <div className="home-card-desc">Escuchá el primer segundo de una canción. Pedí más tiempo si no la reconocés.</div>
          <div className="home-card-badge">
            <div className="badge-dot"/>
            {songDone ? "✓ Ya jugaste hoy" : "Jugar ahora"}
          </div>
          <button className="archive-btn" onClick={e=>{e.stopPropagation();onSelect("song-archive");}}>Ver días pasados →</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  ROOT APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("home");
  const [archiveDayIdx, setArchiveDayIdx] = useState(null);

  const today = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" });
  const todayStr = today.charAt(0).toUpperCase() + today.slice(1);

  function go(v, dayIdx = null) { setView(v); setArchiveDayIdx(dayIdx); }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand" onClick={() => go("home")}>
            <div className="nav-dots">
              <div className="nav-dot"/><div className="nav-dot"/><div className="nav-dot"/>
            </div>
            <span className="nav-title">Daily Games</span>
          </div>
          <div className="nav-right">
            <span className="nav-date">{todayStr}</span>
            {view !== "home" && <button className="nav-back" onClick={() => go("home")}>← Inicio</button>}
          </div>
        </nav>

        {view === "home"        && <HomeScreen onSelect={v => go(v)}/>}
        {view === "lb"          && <LetterboxdGame onBack={() => go(archiveDayIdx != null ? "lb-archive" : "home")} dayIdx={archiveDayIdx ?? undefined}/>}
        {view === "song"        && <SongGame       onBack={() => go(archiveDayIdx != null ? "song-archive" : "home")} dayIdx={archiveDayIdx ?? undefined}/>}
        {view === "lb-archive"  && <ArchiveScreen game="lb"   onSelect={idx => go("lb", idx)}   onBack={() => go("home")}/>}
        {view === "song-archive"&& <ArchiveScreen game="song" onSelect={idx => go("song", idx)} onBack={() => go("home")}/>}
      </div>
    </>
  );
}
