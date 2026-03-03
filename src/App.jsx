import { useState, useEffect } from "react";

const MOVIES = [
  { id:1, title:"Parasite", year:2019, director:"Bong Joon-ho", stars:"★★★★★", reviews:[
    {rank:3,author:"davidehrlich",text:"The best film of the decade is also the funniest, the scariest, and the most heartbreaking. A movie that can't be described without ruining it, and can't be ruined even if you describe it."},
    {rank:2,author:"josh_larsen",text:"A thriller about class anxiety where the tension never breaks — it just transforms, twists, and eventually swallows everything whole. You leave the theatre feeling complicit."},
    {rank:1,author:"natalieabc",text:"Watched it knowing the twist and it's somehow even better. Every frame has a reason to exist. The ram-don scene will live in my brain forever."},
  ]},
  { id:2, title:"Hereditary", year:2018, director:"Ari Aster", stars:"★★★★½", reviews:[
    {rank:3,author:"robinhardwick",text:"The grief in this film is so visceral and raw it feels intrusive to watch. Ari Aster disguised a family trauma drama as a horror movie and the genre bait-and-switch is absolutely merciless."},
    {rank:2,author:"cinephile_m",text:"Toni Collette gives one of the greatest performances in horror history and the Academy completely ignored her. The dinner table scene is the most uncomfortable two minutes of cinema I've ever sat through."},
    {rank:1,author:"midnight_movies",text:"I watched this at noon and still couldn't sleep. The sound design does most of the horror work — that clicking noise will follow me to my grave."},
  ]},
  { id:3, title:"Portrait of a Lady on Fire", year:2019, director:"Céline Sciamma", stars:"★★★★★", reviews:[
    {rank:3,author:"emilygagne",text:"A film about the male gaze made entirely without one. Sciamma inverts every convention of the period romance until what's left is something completely new and devastatingly pure."},
    {rank:2,author:"letterboxd_jess",text:"The last shot destroyed me. I'm not going to describe it. Just know that it's one of the most painful and perfect images cinema has ever produced."},
    {rank:1,author:"cinelover_fr",text:"Two women. A canvas. The sea. And more tension than any action movie I've seen this decade. This is what cinema was invented for."},
  ]},
  { id:4, title:"The Witch", year:2015, director:"Robert Eggers", stars:"★★★★", reviews:[
    {rank:3,author:"horrorgeek92",text:"Not a horror film. A 17th century Puritan family slowly destroying itself from the inside while something watches from the treeline. The supernatural is almost beside the point."},
    {rank:2,author:"black_phillip_fan",text:"Black Phillip is the most terrifying character in horror history and he has maybe four minutes of screen time. The restraint is immaculate. Robert Eggers arrived fully formed."},
    {rank:1,author:"anya_watches",text:"Wouldst thou like to live deliciously? I've never related so hard to a line of dialogue delivered by a goat. The ending is pure liberation."},
  ]},
  { id:5, title:"Annihilation", year:2018, director:"Alex Garland", stars:"★★★★", reviews:[
    {rank:3,author:"scifilover_p",text:"A sci-fi film that actually feels alien. Garland isn't interested in explaining the shimmer — he's interested in what it does to the people who enter it and the audience watching them."},
    {rank:2,author:"natalie_p_era",text:"The lighthouse sequence made me physically lean back in my seat. I've never seen horror and beauty fused so seamlessly. That image of the figure moving on the floor…"},
    {rank:1,author:"brendan_t",text:"Self-destruction as theme, as plot, as form. The structure of the film IS the subject matter. This is what ambitious cinema looks like when it refuses to apologize for its ambitions."},
  ]},
  { id:6, title:"Moonlight", year:2016, director:"Barry Jenkins", stars:"★★★★★", reviews:[
    {rank:3,author:"barryjenkins_fan",text:"Three chapters, one man, a lifetime of silence. Barry Jenkins makes you feel the weight of everything Chiron never says, every emotion he swallows, every wall he builds and hides behind."},
    {rank:2,author:"oscar_night_2017",text:"The beach scene in chapter one might be the most tender thing I've ever seen in an American film. A child being taught how to exist in water. The metaphor is doing enormous work."},
    {rank:1,author:"kevinharrison_jr",text:"The whole film is the answer to one question. And the answer is given in a look, not words. Trevante Rhodes communicates more with his jaw than most actors do with a monologue."},
  ]},
  { id:7, title:"La La Land", year:2016, director:"Damien Chazelle", stars:"★★★★", reviews:[
    {rank:3,author:"damien_fan",text:"Chazelle weaponized nostalgia against me personally. The epilogue sequence is one of the greatest five minutes in film history and I will die defending that claim."},
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
    {rank:2,author:"social_thriller",text:"The party scene is unbearable to sit through. You watch Chris smile and deflect and you feel every microaggression landing. Peele makes discomfort into an art form."},
    {rank:1,author:"allison_w_defense",text:"The milk and the cereal. I think about that scene constantly. Horror embedded in the most mundane domestic image. Jordan Peele is not playing games."},
  ]},
  { id:10, title:"Aftersun", year:2022, director:"Charlotte Wells", stars:"★★★★★", reviews:[
    {rank:3,author:"paul_mescal_crying",text:"A film that hits you once and then hits you again three days later when you're doing dishes. The horror is entirely retroactive and therefore inescapable. Charlotte Wells made a debut that most directors never match in a career."},
    {rank:2,author:"aftersun_letters",text:"The Under Pressure scene. I won't describe it. I'll just say it's the most devastating use of a song in recent cinema and that I've never been the same since."},
    {rank:1,author:"scotland_on_film",text:"What did you want to be when you grew up? I've never heard a more terrifying question. The whole film is a child not understanding what she was watching. The whole point is that she understands now."},
  ]},
  { id:11, title:"Mulholland Drive", year:2001, director:"David Lynch", stars:"★★★★★", reviews:[
    {rank:3,author:"lynch_dream",text:"I fell asleep during the first watch, woke up, and the movie somehow made more sense. Lynch operating on a frequency humans weren't designed to hear."},
    {rank:2,author:"naomi_watts_era",text:"The diner scene with the monster behind the wall destroyed me. I still think about it at random moments three years later, usually at night."},
    {rank:1,author:"silencio_forever",text:"A love letter to Hollywood written in disappearing ink. Every rewatch I find new corridors. The dream logic is the only logic."},
  ]},
  { id:12, title:"Blade Runner 2049", year:2017, director:"Denis Villeneuve", stars:"★★★★½", reviews:[
    {rank:3,author:"deakins_worship",text:"Three hours of Roger Deakins painting with light and I would have sat for three more. The scene in the orange wasteland made me forget to breathe."},
    {rank:2,author:"imax_seeker",text:"Saw it in IMAX. The sound design alone is worth the price of a therapist. This movie asks what it means to have a soul, then refuses to answer. Correct."},
    {rank:1,author:"ryan_g_fan",text:"One of the loneliest films ever made. K is the saddest character in modern sci-fi and Gosling barely says fifteen words per act. Devastating."},
  ]},
  { id:13, title:"The Power of the Dog", year:2021, director:"Jane Campion", stars:"★★★★", reviews:[
    {rank:3,author:"campion_returns",text:"Jane Campion came back and reminded everyone what psychological tension actually feels like. Every scene has an undercurrent of violence that never fully arrives — and that's scarier than if it did."},
    {rank:2,author:"benedict_c_fan",text:"Cumberbatch plays cruelty as a form of self-protection and it is genuinely disturbing. The film reveals his character slowly, like peeling back dead skin."},
    {rank:1,author:"montana_wide",text:"The landscape is a character. The silence is a weapon. And the final revelation recontextualizes everything you watched with a cruelty that takes your breath away."},
  ]},
  { id:14, title:"Whiplash", year:2014, director:"Damien Chazelle", stars:"★★★★½", reviews:[
    {rank:3,author:"jazz_drummer",text:"Not a film about music. A film about the violence of perfectionism, about whether greatness can be extracted through cruelty, and whether that greatness is even worth having."},
    {rank:2,author:"jk_simmons_god",text:"J.K. Simmons is terrifying without ever raising a fist. The abuse is psychological, methodical, almost pedagogical. The scariest teacher ever put on screen."},
    {rank:1,author:"finale_forever",text:"The final concert scene is one of the most exhilarating sequences in cinema. I forgot it was a movie. My hands were sweating. My jaw was clenched. Perfect."},
  ]},
  { id:15, title:"The Favourite", year:2018, director:"Yorgos Lanthimos", stars:"★★★★", reviews:[
    {rank:3,author:"lanthimos_cult",text:"A period drama that refuses to behave like one. The fisheye lens, the anachronistic music, the razor-sharp dialogue — Lanthimos makes historical settings feel profoundly, disturbingly contemporary."},
    {rank:2,author:"olivia_colman_fan",text:"Three women clawing for power in a palace and every single one of them is the protagonist, the villain, and the victim simultaneously. The performances are immaculate."},
    {rank:1,author:"rabbits_ending",text:"That ending with the rabbits is one of the most unsettling images I've seen in a mainstream film. It lingers. It refuses to mean just one thing. It's perfect."},
  ]},
  { id:16, title:"Tár", year:2022, director:"Todd Field", stars:"★★★★½", reviews:[
    {rank:3,author:"classical_cinema",text:"A film about power, about how we consume art made by terrible people, and about the terrifying logic of cancel culture from inside the machine. Todd Field disappeared for 16 years and came back with this."},
    {rank:2,author:"cate_blanchett_era",text:"Cate Blanchett gives the best performance of the decade. She plays Lydia Tár as someone who has never once considered that the rules apply to her. The unraveling is excruciating."},
    {rank:1,author:"conductor_watch",text:"The opening interview sequence is fifteen minutes long and it sets up every single thing the film will destroy. The patience of this movie is extraordinary."},
  ]},
  { id:17, title:"Drive", year:2011, director:"Nicolas Winding Refn", stars:"★★★★", reviews:[
    {rank:3,author:"neon_noir_fan",text:"Nicolas Winding Refn made a Hollywood genre film and buried it under so many layers of European art cinema that it became something completely unclassifiable. The silence is deafening."},
    {rank:2,author:"gosling_scorpion",text:"Ryan Gosling barely speaks and it's the most expressive performance of his career. The elevator scene contains more emotion in thirty seconds than most films manage in two hours."},
    {rank:1,author:"kavinsky_dreams",text:"The soundtrack alone makes it iconic. But it's the combination of dreamy 80s synth and sudden, grotesque violence that makes it genuinely unforgettable."},
  ]},
  { id:18, title:"The Social Network", year:2010, director:"David Fincher", stars:"★★★★½", reviews:[
    {rank:3,author:"fincher_faithful",text:"David Fincher made a film about the founding of Facebook that plays like a Greek tragedy. Jesse Eisenberg is magnetic and terrible. The Sorkin dialogue moves at a speed human beings cannot sustain."},
    {rank:2,author:"sorkin_typed",text:"The opening scene is five minutes of the fastest dialogue ever written and it tells you everything about who Mark Zuckerberg is. The rest of the film is just watching him prove it."},
    {rank:1,author:"trent_reznor_fan",text:"Trent Reznor and Atticus Ross won the Oscar and it wasn't even close. The score doesn't underline the emotion — it replaces it. Cold, propulsive, inevitable."},
  ]},
  { id:19, title:"Marriage Story", year:2019, director:"Noah Baumbach", stars:"★★★★½", reviews:[
    {rank:3,author:"divorce_cinema",text:"Noah Baumbach made a film about divorce that is also the most tender love story of the decade. The argument scene is one of the greatest pieces of acting ever committed to film."},
    {rank:2,author:"adam_driver_stans",text:"Adam Driver singing 'Being Alive' at the end destroyed something in me that I haven't fully rebuilt. He just stands there and sings and the whole film collapses into it."},
    {rank:1,author:"scarjo_legal",text:"The lawyer scenes are devastatingly funny and then suddenly devastating. Laura Dern plays someone who understands that the law is not about fairness, and she eats every scene she's in."},
  ]},
  { id:20, title:"Burning", year:2018, director:"Lee Chang-dong", stars:"★★★★½", reviews:[
    {rank:3,author:"lee_chang_dong",text:"A mystery with no solution, a thriller with no resolution, a love story with no happy ending. Lee Chang-dong builds tension for two and a half hours and never releases it. You leave feeling haunted."},
    {rank:2,author:"steven_yeun_global",text:"Steven Yeun's performance is the most chilling thing I've seen in years. He plays a man who may or may not be a murderer with the calm of someone who has never needed to explain himself."},
    {rank:1,author:"greenhouse_burning",text:"The scene where she dances at sunset while he watches is one of the most beautiful and sinister images I've seen. I thought about it every day for a week."},
  ]},
  { id:21, title:"Her", year:2013, director:"Spike Jonze", stars:"★★★★½", reviews:[
    {rank:3,author:"spike_jonze_fan",text:"A film about loneliness disguised as a film about technology. Spike Jonze predicted everything wrong with how we relate to each other in the digital age and he did it with a love story."},
    {rank:2,author:"scarlett_voice",text:"Scarlett Johansson does more with her voice alone than most actors do with their entire bodies. The relationship feels completely real, which makes the ending completely devastating."},
    {rank:1,author:"los_angeles_future",text:"The production design of a warm, muted, slightly wrong future Los Angeles is one of the most beautiful visions of the near future ever put on screen."},
  ]},
  { id:22, title:"The Lighthouse", year:2019, director:"Robert Eggers", stars:"★★★★½", reviews:[
    {rank:3,author:"eggers_apostle",text:"Robert Eggers shot a film in black and white 1.19:1 ratio about two men going insane on an island and it is one of the most formally audacious things I've seen in a cinema."},
    {rank:2,author:"dafoe_pattinson",text:"Dafoe and Pattinson. Two hours. A lighthouse. No one else. The performances are so committed and so unhinged that by the end you're not sure who is real."},
    {rank:1,author:"prometheus_ending",text:"The final image. I closed my eyes. I opened them again. It was still there. Eggers isn't making horror films — he's building modern myths."},
  ]},
  { id:23, title:"Midsommar", year:2019, director:"Ari Aster", stars:"★★★★", reviews:[
    {rank:3,author:"folk_horror_fan",text:"A horror film set entirely in daylight, which shouldn't work and absolutely does. Ari Aster understood that the most disturbing thing isn't darkness — it's a community that smiles while it destroys you."},
    {rank:2,author:"florence_pugh_era",text:"Florence Pugh crying on the grass while the cult women mirror her grief is the most cathartic image of 2019. This is a breakup movie dressed as folk horror and both readings are correct."},
    {rank:1,author:"may_queen_me",text:"I came for horror and got a film about a woman finally being truly, completely seen — even if what sees her is a pagan cult. The ending is horrifying and triumphant simultaneously."},
  ]},
  { id:24, title:"Past Lives", year:2023, director:"Celine Song", stars:"★★★★★", reviews:[
    {rank:3,author:"celine_song_debut",text:"The most devastating film of 2023 and it never once raises its voice. Celine Song understands that the saddest things in life are not tragedies but choices — and the lives unlived because of them."},
    {rank:2,author:"greta_lee_forever",text:"Greta Lee in the final scene, in the car, alone — I've never seen a face carry so much simultaneously. Joy and grief and love and loss in one expression. How?"},
    {rank:1,author:"in_yun_believer",text:"The concept of in-yun — that meeting someone requires 8,000 layers of fate — makes the ending unbearable. Because if all that was needed to get here, what does here even mean?"},
  ]},
  { id:25, title:"Oppenheimer", year:2023, director:"Christopher Nolan", stars:"★★★★½", reviews:[
    {rank:3,author:"nolan_faithful",text:"Christopher Nolan made a three-hour IMAX film about a man who invented the apocalypse and it never once feels long. The trial scenes are more tense than any action sequence he's ever directed."},
    {rank:2,author:"cillian_era",text:"Cillian Murphy's eyes contain the entire film. He plays a man watching himself become a symbol and losing himself in the process. The weight of that is in every frame he's in."},
    {rank:1,author:"trinity_test_fan",text:"The Trinity test sequence. No score. Just silence, then the blast, then the sound catching up. I've never felt dread in an IMAX theater like that. I understood, physically, what it felt like to witness the end."},
  ]},
  { id:26, title:"Roma", year:2018, director:"Alfonso Cuarón", stars:"★★★★★", reviews:[
    {rank:3,author:"cuaron_memoria",text:"Alfonso Cuarón's memory film is a love letter to a woman who was largely invisible in his own childhood. The act of seeing her now, fully, as the center of everything, is itself the film's moral argument."},
    {rank:2,author:"yalitza_aparicio",text:"Yalitza Aparicio had never acted before this film. Her face holds everything. The beach scene at the end — a non-actress wading into the ocean to save two children — made me forget to breathe."},
    {rank:1,author:"black_white_mexico",text:"Shot in black and white and deeply, achingly specific. Every frame looks like a memory that's been preserved just slightly beyond what memory allows. It's grief rendered as image."},
  ]},
  { id:27, title:"The Grand Budapest Hotel", year:2014, director:"Wes Anderson", stars:"★★★★½", reviews:[
    {rank:3,author:"wes_symmetry",text:"Wes Anderson's most complete film. The artifice is the point — he built a dollhouse Europe and then showed you the real grief hiding inside it. The melancholy hits harder because the surface is so pretty."},
    {rank:2,author:"ralph_fiennes_hat",text:"Ralph Fiennes at the peak of his comedic powers, which turns out to be a completely different peak than his dramatic powers and both are towering. M. Gustave is one of cinema's great characters."},
    {rank:1,author:"lobby_boy_life",text:"The frame-within-a-frame-within-a-frame structure isn't a gimmick — it's the story. Each layer of storytelling is a layer of loss. By the time you understand that, the film is over."},
  ]},
  { id:28, title:"Arrival", year:2016, director:"Denis Villeneuve", stars:"★★★★½", reviews:[
    {rank:3,author:"villeneuve_science",text:"Denis Villeneuve made first contact feel like grief. The film reframes everything you've watched in its final minutes and somehow every choice that came before becomes more beautiful, not less."},
    {rank:2,author:"amy_adams_carries",text:"Amy Adams holds this film together through sheer emotional intelligence. The scene where she walks into the alien ship alone — calm, prepared, terrified — is one of the decade's great moments of acting."},
    {rank:1,author:"heptapod_linguist",text:"A film that argues that knowing the future doesn't make it easier — it makes it more meaningful. I've thought about that idea every day since I saw it. Arrival changed how I think about time."},
  ]},
  { id:29, title:"Phantom Thread", year:2017, director:"Paul Thomas Anderson", stars:"★★★★½", reviews:[
    {rank:3,author:"pta_devotee",text:"Paul Thomas Anderson made a film about a controlling man and a woman who finds the one way to hold power over him, and it is somehow one of the most romantic films of the decade."},
    {rank:2,author:"daniel_ddl_final",text:"Daniel Day-Lewis' final performance is a masterclass in playing a man who mistakes rigidity for identity. Every breakfast scene is a battle. Every dress fitting is a negotiation of dominance."},
    {rank:1,author:"vicky_krieps_wins",text:"Vicky Krieps steals the film from Daniel Day-Lewis, which should be impossible. She plays submission as strategy and the film belongs to her from the moment she orders the massive breakfast."},
  ]},
  { id:30, title:"Shoplifters", year:2018, director:"Hirokazu Kore-eda", stars:"★★★★★", reviews:[
    {rank:3,author:"koreeda_family",text:"Hirokazu Kore-eda asks what makes a family and answers it not with dialogue but with small acts of care — shared meals, inside jokes, physical warmth. Then he shows you what the law thinks a family is."},
    {rank:2,author:"palme_dor_2018",text:"The reveal of what this family actually is, and how they came to be, doesn't make you love them less. It makes you love them more. That is an extraordinary achievement in storytelling."},
    {rank:1,author:"japanese_poverty",text:"The scene where the child waves goodbye through the window is one of the most heartbreaking images in cinema. The film earns it completely. I cried in public and I regret nothing."},
  ]},
  { id:31, title:"First Reformed", year:2017, director:"Paul Schrader", stars:"★★★★½", reviews:[
    {rank:3,author:"schrader_returns",text:"Paul Schrader at 70 making his masterpiece. A film about a man losing his faith in God and humanity simultaneously, told through a journal that gets more desperate with every entry."},
    {rank:2,author:"ethan_hawke_best",text:"The best performance of Ethan Hawke's career and it's not close. He plays hollowness in the shape of a man. You watch the light going out behind his eyes in real time."},
    {rank:1,author:"levitation_scene",text:"The levitation scene. I don't know how to explain it. I don't know if it's real in the film's logic. I know it made me feel something I've never felt watching a movie. Schrader reached me."},
  ]},
  { id:32, title:"The Banshees of Inisherin", year:2022, director:"Martin McDonagh", stars:"★★★★½", reviews:[
    {rank:3,author:"mcdonagh_island",text:"Martin McDonagh set a film about the Irish Civil War on a tiny island and told it through the story of a man who simply decides to stop being someone's friend. The allegory is so precise it hurts."},
    {rank:2,author:"colin_brendan_duo",text:"Colin Farrell plays bewilderment as tragedy and it works completely. He cannot understand why his friend no longer likes him, and that incomprehension is the most human thing I've seen on screen this year."},
    {rank:1,author:"donkey_jenny_fan",text:"Martin McDonagh is a cruel filmmaker and I mean that as the highest compliment. He will not give you what you want. He will give you something worse. The ending is a gut punch delivered slowly."},
  ]},
  { id:33, title:"Past Lives", year:2023, director:"Celine Song", stars:"★★★★★", reviews:[
    {rank:3,author:"celine_song_debut",text:"The most devastating film of 2023 and it never once raises its voice. Celine Song understands that the saddest things in life are not tragedies but choices — and the lives unlived because of them."},
    {rank:2,author:"greta_lee_forever",text:"Greta Lee in the final scene, in the car, alone — I've never seen a face carry so much simultaneously. Joy and grief and love and loss in one expression. How?"},
    {rank:1,author:"in_yun_believer",text:"The concept of in-yun — that meeting someone requires 8,000 layers of fate — makes the ending unbearable. Because if all that was needed to get here, what does here even mean?"},
  ]},
  { id:34, title:"Spencer", year:2021, director:"Pablo Larraín", stars:"★★★★", reviews:[
    {rank:3,author:"larrain_portrait",text:"Pablo Larraín made a psychological horror film about a woman being crushed by an institution, and he's calling it a princess biopic. Both descriptions are accurate. This is Diana's mind coming apart at Christmas."},
    {rank:2,author:"kristen_stewart_fan",text:"Kristen Stewart gives a performance so physical and so desperate that I stopped seeing Diana and started seeing someone drowning in full view of a crowd that refuses to acknowledge it."},
    {rank:1,author:"ghost_anne_boleyn",text:"Anne Boleyn appears as a ghost and it's not a dream sequence — it's the only logical thing in the film. History as haunting. The crown as murder weapon. Extraordinary."},
  ]},
  { id:35, title:"The Holdovers", year:2023, director:"Alexander Payne", stars:"★★★★½", reviews:[
    {rank:3,author:"payne_comeback",text:"Alexander Payne made a film so warm and funny and sad that I forgot I was watching a film. It just felt like spending time with people I loved and then having to say goodbye."},
    {rank:2,author:"paul_giamatti_again",text:"Paul Giamatti hasn't been this good since Sideways, which is saying everything. He plays a man whose entire personality is a wall he built to keep people out, and the film is about one Christmas that damaged the wall."},
    {rank:1,author:"da_vine_joy_randolph",text:"Da'Vine Joy Randolph. Full stop. Her grief is the moral center of the film and she carries it with such dignity and such pain that every scene she's in becomes the most important scene in the movie."},
  ]},
  { id:36, title:"Joker", year:2019, director:"Todd Phillips", stars:"★★★★", reviews:[
    {rank:3,author:"phoenix_committed",text:"Whatever you think of the politics, Joaquin Phoenix gives a performance so committed and physically total that it demands to be seen. He didn't play the Joker — he dissolved into him."},
    {rank:2,author:"staircase_scene",text:"The staircase dance scene is one of those rare moments where a film suddenly becomes itself. Up to that point it's good. After that point it's something else entirely."},
    {rank:1,author:"de_niro_mirror",text:"The De Niro casting is so deliberate it borders on theory. Todd Phillips made a King of Comedy sequel that De Niro doesn't know he's in. That's either genius or audacity. Possibly both."},
  ]},
  { id:37, title:"Bones and All", year:2022, director:"Luca Guadagnino", stars:"★★★★", reviews:[
    {rank:3,author:"guadagnino_road",text:"A road movie about two outcasts falling in love that is also the most tender film about belonging and self-acceptance of the year. Guadagnino makes the unacceptable feel inevitable."},
    {rank:2,author:"timothee_taylor_duo",text:"Timothée Chalamet and Taylor Russell have the kind of chemistry that makes you believe entirely in their doomed love story. The film doesn't romanticize what they are — but it loves who they are."},
    {rank:1,author:"mark_rylance_sully",text:"Mark Rylance appears for twenty minutes and makes the whole film feel dangerous. He plays a man who has accepted himself completely, and his peace is more frightening than any rage."},
  ]},
  { id:38, title:"C'mon C'mon", year:2021, director:"Mike Mills", stars:"★★★★", reviews:[
    {rank:3,author:"mike_mills_bw",text:"Mike Mills shot a film about an uncle and a nephew in black and white and made the most tender, intelligent film about children I've ever seen. It listens to the child as though his thoughts matter. Because they do."},
    {rank:2,author:"joaquin_uncle",text:"Joaquin Phoenix plays softness and uncertainty and it's almost disorienting after years of watching him play intensity. He's wonderful here in a way that requires him to do less, which turns out to be much harder."},
    {rank:1,author:"woody_norman_kid",text:"Woody Norman is one of the best child performances in recent memory. He plays a kid who asks real questions and refuses easy answers and somehow this is the most radical act a film can perform."},
  ]},
  { id:39, title:"Zola", year:2021, director:"Janicza Bravo", stars:"★★★★", reviews:[
    {rank:3,author:"twitter_film",text:"A film based on a Twitter thread that is more formally inventive than most films based on novels. Janicza Bravo captured the cadence of social media storytelling and turned it into cinema. It should not work this well."},
    {rank:2,author:"taylour_paige_now",text:"Taylour Paige's face throughout this film is a masterclass in contained fury. She knows things the audience doesn't. She knows things the other characters don't. She knows too much."},
    {rank:1,author:"colman_domingo_zola",text:"Colman Domingo plays a character so menacing and so funny that laughing at him feels like a trap — and it is. The film uses genre to talk about exploitation in ways a drama never could."},
  ]},
  { id:40, title:"Beau Is Afraid", year:2023, director:"Ari Aster", stars:"★★★½", reviews:[
    {rank:3,author:"aster_committed",text:"Ari Aster made a three-hour anxiety dream about a man who cannot stop apologizing for existing, and it is one of the most committed pieces of cinema I've ever been assaulted by. I mean that warmly."},
    {rank:2,author:"joaquin_beau",text:"Joaquin Phoenix plays a man so paralyzed by guilt and fear that just watching him move through a scene becomes unbearable. It is a performance of extraordinary physical commitment."},
    {rank:1,author:"no_easy_answers",text:"This film will not be for everyone and Ari Aster knows that and does not care. That defiance — making something genuinely weird at massive scale — is itself a kind of heroism."},
  ]},
];

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getDailyMovie() {
  const epoch = new Date(2024, 0, 1);
  const days = Math.floor((new Date() - epoch) / 86400000);
  return MOVIES[((days % MOVIES.length) + MOVIES.length) % MOVIES.length];
}

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}

function getTimeUntilMidnight() {
  const now = new Date();
  const mid = new Date(now); mid.setHours(24,0,0,0);
  const diff = mid - now;
  return {
    h: Math.floor(diff/3600000),
    m: Math.floor((diff%3600000)/60000),
    s: Math.floor((diff%60000)/1000),
  };
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#14181c;--surface:#1c2228;--surface2:#212830;
    --border:#2c3440;--border2:#3a4455;
    --green:#00c030;--green-dark:#009924;--green-glow:rgba(0,192,48,0.12);
    --blue:#40bcf4;--orange:#ff8000;
    --text:#9ab;--text-bright:#cdd5db;--text-dim:#4a5568;
    --radius:8px;--font:'DM Sans',system-ui,sans-serif;--serif:'Source Serif 4',Georgia,serif;
  }
  html,body{background:var(--bg);color:var(--text-bright);font-family:var(--font);min-height:100vh;-webkit-font-smoothing:antialiased}
  .app{min-height:100vh;display:flex;flex-direction:column;align-items:center;background:var(--bg)}

  /* NAV */
  .nav{width:100%;max-width:640px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
  .nav-brand{display:flex;align-items:center;gap:8px}
  .nav-dots{display:flex;gap:3px;align-items:center}
  .nav-dot{border-radius:50%}
  .nav-dot:nth-child(1){width:8px;height:8px;background:var(--green)}
  .nav-dot:nth-child(2){width:10px;height:10px;background:var(--blue)}
  .nav-dot:nth-child(3){width:8px;height:8px;background:var(--orange)}
  .nav-title{font-family:var(--serif);font-size:1rem;color:var(--text-bright)}
  .nav-date{font-size:0.68rem;color:var(--text-dim);letter-spacing:0.06em;font-weight:500;text-transform:uppercase}

  /* MAIN */
  .main{width:100%;max-width:640px;padding:1.5rem 1.25rem 3rem;display:flex;flex-direction:column;gap:1.25rem}

  /* HEADER */
  .header-label{font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-dim);font-weight:600;margin-bottom:0.25rem}
  .header-title{font-family:var(--serif);font-size:clamp(1.2rem,3.5vw,1.6rem);font-weight:300;color:var(--text-bright);line-height:1.25}

  /* PIPS */
  .pips-row{display:flex;gap:6px;align-items:center}
  .pip-wrap{display:flex;flex-direction:column;gap:3px;align-items:center}
  .pip{width:40px;height:3px;border-radius:2px;background:var(--border);transition:background 0.3s}
  .pip.lit{background:var(--green)}
  .pip-label{font-size:0.55rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);font-weight:600}
  .pip-sep{width:1px;height:16px;background:var(--border);margin:0 4px}
  .pts-now{font-size:0.7rem;font-weight:700;color:var(--text-dim)}
  .pts-now b{color:var(--green);font-size:0.85rem}

  /* CARD */
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
  .stars{color:var(--orange);font-size:0.82rem;letter-spacing:-0.5px}
  .quote-text{font-family:var(--serif);font-size:clamp(0.9rem,2vw,1.08rem);font-weight:300;line-height:1.72;color:var(--text-bright);font-style:italic;flex:1}
  .quote-author{font-size:0.68rem;color:var(--text-dim);font-weight:500}
  .quote-author span{color:var(--green)}
  .tap-hint{font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);text-align:center;padding-top:0.65rem;border-top:1px solid var(--border);opacity:0.4;cursor:pointer;transition:opacity 0.15s}
  .tap-hint:hover{opacity:0.7}
  .rear-icon{font-size:2rem}
  .rear-title{font-family:var(--serif);font-size:clamp(1.3rem,4vw,1.9rem);font-weight:400;color:var(--text-bright);line-height:1.2}
  .rear-meta{font-size:0.73rem;color:var(--text-dim);letter-spacing:0.04em}
  .rear-stars{color:var(--orange);font-size:0.95rem;letter-spacing:-0.5px}

  /* ACTIONS */
  .actions{display:flex;flex-direction:column;gap:0.8rem}
  .toast{padding:0.8rem 1rem;border-radius:var(--radius);font-size:0.86rem;font-weight:500;text-align:center;animation:up 0.2s ease}
  .toast.ok{background:rgba(0,192,48,0.07);border:1px solid var(--green-dark);color:var(--green)}
  .toast.fail{background:rgba(255,80,80,0.06);border:1px solid #5a2a2a;color:#e07070}
  .toast.info{background:var(--surface2);border:1px solid var(--border2);color:var(--text)}
  @keyframes up{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  .input-row{display:flex;gap:0.5rem}
  .guess-inp{flex:1;padding:0.75rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-bright);font-family:var(--font);font-size:0.9rem;outline:none;transition:border-color 0.15s}
  .guess-inp:focus{border-color:var(--green-dark)}
  .guess-inp::placeholder{color:var(--text-dim)}
  .guess-btn{padding:0.75rem 1.25rem;background:var(--green);border:none;border-radius:var(--radius);color:#000;font-family:var(--font);font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap}
  .guess-btn:hover{background:#00d836}
  .hint-actions{display:flex;gap:0.5rem;flex-wrap:wrap}
  .btn-ghost{padding:0.6rem 1rem;border-radius:var(--radius);cursor:pointer;font-family:var(--font);font-size:0.75rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.15s;border:1px solid var(--border2);background:transparent;color:var(--text-dim)}
  .btn-ghost:hover{border-color:var(--text);color:var(--text-bright)}
  .btn-ghost.danger{border-color:#4a2020;color:#a05050}
  .btn-ghost.danger:hover{border-color:#7a3030;color:#e07070}

  /* DONE / TOMORROW */
  .tomorrow{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.75rem;padding:2rem;text-align:center}
  .tomorrow-icon{font-size:3rem}
  .tomorrow-title{font-family:var(--serif);font-size:clamp(1.4rem,5vw,2rem);font-weight:300;color:var(--text-bright);line-height:1.25}
  .tomorrow-title em{color:var(--green);font-style:normal}
  .tomorrow-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem 1.75rem;display:flex;flex-direction:column;gap:1rem;width:100%;max-width:380px}
  .t-label{font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-dim);font-weight:600}
  .t-movie-title{font-family:var(--serif);font-size:1.25rem;color:var(--text-bright);margin-top:0.2rem}
  .t-movie-meta{font-size:0.72rem;color:var(--text-dim);margin-top:0.1rem}
  .divider{width:100%;height:1px;background:var(--border)}
  .score-row{display:flex;align-items:center;justify-content:space-between;padding:0.7rem 0.9rem;border-radius:var(--radius);background:var(--surface2);border:1px solid var(--border)}
  .score-row-label{font-size:0.72rem;color:var(--text-dim);font-weight:500}
  .score-row-val{font-size:1.15rem;font-weight:700;color:var(--green);font-family:var(--font)}
  .streak-pill{display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;border-radius:100px;background:var(--surface2);border:1px solid var(--border);font-size:0.72rem;color:var(--text-dim);font-weight:500;align-self:center}
  .streak-pill b{color:var(--orange)}
  .countdown-box{display:flex;flex-direction:column;align-items:center;gap:0.35rem}
  .countdown-label{font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-dim);font-weight:600}
  .countdown{font-family:var(--font);font-size:1.7rem;font-weight:600;color:var(--text-bright);letter-spacing:0.04em}
  .countdown span{color:var(--text-dim);font-weight:300;font-size:1.1rem}
`;

const HINT_NAMES = ["3ª reseña","2ª reseña","1ª reseña"];
const POINTS = [3,2,1];

export default function App() {
  const movie = getDailyMovie();
  const todayKey = getTodayKey();

  const saved = (() => { try { return JSON.parse(localStorage.getItem("gtf_v2")||"{}"); } catch { return {}; } })();
  const alreadyPlayed = saved.date === todayKey;

  const [hintLevel, setHintLevel] = useState(0);
  const [flipped, setFlipped] = useState(alreadyPlayed);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [roundOver, setRoundOver] = useState(alreadyPlayed);
  const [score, setScore] = useState(alreadyPlayed ? (saved.score ?? 0) : null);
  const [screen, setScreen] = useState(alreadyPlayed ? "done" : "game");
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const [streak, setStreak] = useState(saved.streak ?? 0);

  useEffect(() => {
    if (screen !== "done") return;
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, [screen]);

  function persist(sc, hl) {
    const yesterday = (() => { const d=new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; })();
    const newStreak = saved.date === yesterday ? (saved.streak ?? 0) + 1 : 1;
    setStreak(newStreak);
    localStorage.setItem("gtf_v2", JSON.stringify({ date:todayKey, score:sc, hintLevel:hl, streak:newStreak }));
  }

  const review = movie.reviews.find(r => r.rank === 3 - hintLevel);

  function handleGuess() {
    if (!guess.trim()) return;
    const hit = normalize(movie.title).includes(normalize(guess)) || normalize(guess).includes(normalize(movie.title));
    if (hit) {
      const pts = POINTS[hintLevel];
      setScore(pts); setFeedback("ok"); setFeedbackMsg(`¡Correcto! +${pts} ${pts===1?"punto":"puntos"}`);
      setFlipped(true); setRoundOver(true); persist(pts, hintLevel);
      setTimeout(() => setScreen("done"), 2000);
    } else {
      setFeedback("fail"); setFeedbackMsg("Incorrecto, intentá de nuevo");
      setTimeout(() => setFeedback(null), 1400);
    }
    setGuess("");
  }

  function handleHint() {
    if (hintLevel < 2) { setHintLevel(h => h+1); setFeedback(null); }
  }

  function handleGiveUp() {
    setFlipped(true); setScore(0); setRoundOver(true);
    setFeedback("info"); setFeedbackMsg(`La película era "${movie.title}" (${movie.year})`);
    persist(0, hintLevel);
    setTimeout(() => setScreen("done"), 2200);
  }

  const pad = n => String(n).padStart(2,"0");
  const today = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" });
  const todayStr = today.charAt(0).toUpperCase() + today.slice(1);
  const hintUsed = score != null ? HINT_NAMES[POINTS.indexOf(score)] : null;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-dots">
              <div className="nav-dot"/><div className="nav-dot"/><div className="nav-dot"/>
            </div>
            <span className="nav-title">Guess the Film</span>
          </div>
          <span className="nav-date">{todayStr}</span>
        </nav>

        {screen === "game" && (
          <div className="main">
            <div>
              <p className="header-label">Película del día</p>
              <h1 className="header-title">¿De qué película es esta reseña?</h1>
            </div>

            <div className="pips-row">
              {[0,1,2].map(i => (
                <div key={i} className="pip-wrap">
                  <div className={`pip${i<=hintLevel?" lit":""}`}/>
                  <span className="pip-label">{POINTS[i]}pt</span>
                </div>
              ))}
              <div className="pip-sep"/>
              <span className="pts-now">Pista actual: <b>{POINTS[hintLevel]} pts</b></span>
            </div>

            <div className="scene">
              <div className={`card-wrap${flipped?" flipped":""}`}>
                <div className="card-face">
                  <div className="front-body">
                    <div className="hint-meta">
                      <div className="hint-tag"><div className="hint-dot"/>{HINT_NAMES[hintLevel]}</div>
                      <div className="pts-pill"><b>{POINTS[hintLevel]}</b> pts</div>
                    </div>
                    <div className="quote-area">
                      <div className="stars">{movie.stars}</div>
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
                    <input className="guess-inp" placeholder="Escribí el título de la película..."
                      value={guess} onChange={e => setGuess(e.target.value)}
                      onKeyDown={e => e.key==="Enter" && handleGuess()} autoComplete="off"/>
                    <button className="guess-btn" onClick={handleGuess}>OK</button>
                  </div>
                  <div className="hint-actions">
                    {hintLevel < 2 && <button className="btn-ghost" onClick={handleHint}>Ver pista → {HINT_NAMES[hintLevel+1]}</button>}
                    <button className="btn-ghost danger" onClick={handleGiveUp}>Rendirse</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {screen === "done" && (
          <div className="tomorrow">
            <div className="tomorrow-icon">
              {score===3?"🏆":score===2?"⭐":score===1?"✅":"😔"}
            </div>
            <h2 className="tomorrow-title">
              {score > 0
                ? <>¡Adivinaste la película del día!</>
                : <>No pasa nada,<br/><em>volvé mañana</em></>
              }
            </h2>

            <div className="tomorrow-card">
              <div>
                <p className="t-label">Película de hoy</p>
                <p className="t-movie-title">{movie.title}</p>
                <p className="t-movie-meta">{movie.year} · {movie.director} · {movie.stars}</p>
              </div>
              <div className="divider"/>
              <div className="score-row">
                <span className="score-row-label">
                  {score > 0 ? `Adivinaste con la ${hintUsed}` : "Sin puntos hoy"}
                </span>
                <span className="score-row-val">{score ?? 0} pts</span>
              </div>
              {streak > 1 && (
                <div className="streak-pill">
                  <span>🔥</span>
                  <span><b>{streak}</b> días seguidos</span>
                </div>
              )}
            </div>

            <div className="countdown-box">
              <span className="countdown-label">Próxima película en</span>
              <span className="countdown">
                {pad(countdown.h)}<span>h</span> {pad(countdown.m)}<span>m</span> {pad(countdown.s)}<span>s</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
