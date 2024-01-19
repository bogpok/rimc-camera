const values = [];

class Recipe {
    constructor(
        name,
        short,
        description,
        url        
    ) {
        this.name = name;
        this.short = short;
        this.description = description;
        this.url = url;
    }    
}

const recipes = [
    new Recipe('classic vintage', 'CLSC', 'as it is now in rimc engine', null),
    new Recipe('gold', 'GOLD', 'kodak gold', 'https://film.recipes/2022/07/01/classic-gold-like-expired-film-kodak-gold/'),
    new Recipe('portrait', 'PORT', 'portra', 'https://film.recipes/2022/05/15/kodak-portra-grainy-for-a-portra-400-look/'),
    new Recipe('super', 'SUPR', 'superia', 'https://film.recipes/2022/05/24/mother-superia-the-anytime-fujicolor-film/'),
    new Recipe('silver bw', 'bwSV', 'silvertone', 'https://film.recipes/2022/09/15/silvertone-99-for-deep-metallic-mono/'),
    new Recipe('retro bw', 'bwRE', 'retro bw', 'https://film.recipes/2022/08/22/claunch-72-monotone-hipstamagic/'),
]

recipes.forEach(recipe=>{
    values.push(recipe.short);
})

knobrecipes = new KnobCollection(recipes);
console.log(knobrecipes)

const dial = new Knob(document.getElementById("dial"));

const dial_mark_ratio = 36 / 245;
const mark = new Control(document.getElementById("dialmark"));
mark.set_topleft([
    dial.rect.right - dial_mark_ratio*64,
    dial.rect.top + dial.rect.height / 2
])
mark.set_width(dial_mark_ratio*dial.get_rect().width);