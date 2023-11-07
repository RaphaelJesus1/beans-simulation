function get_input_values_for_neuralnet(organism: Organism, qtreeOrganisms: OrganismQuadTree, qtreeVegetables:VegetableQuadTree, vision: Circle) {
    var input_values: { [key: string]: number | null } = {};
    var index_closest_food: number;
    var index_closest_organism: number;
    var distance_closest_food: number;
    var distance_closest_organism: number;
    var angle_closest_food: number | null;
    var angle_closest_organism: number | null;
    var vegetable_distance_and_index: Array<number>;
    var vegetables_in_view: Array<Point>;
    var organisms_in_view: Array<Point>;
    var organism_distance_and_index: Array<number>;

    vegetables_in_view = qtreeVegetables.search_elements(vision)
    vegetable_distance_and_index = get_distance_and_index_of_closest_element(organism, vegetables_in_view)
    distance_closest_food = vegetable_distance_and_index[0]
    index_closest_food = vegetable_distance_and_index[1]
    angle_closest_food = get_angle_to_closest_element(organism, vegetables_in_view[index_closest_food])

    organisms_in_view = qtreeOrganisms.search_elements(vision, organism.id);
    organism_distance_and_index = get_distance_and_index_of_closest_element(organism, organisms_in_view)
    distance_closest_organism = organism_distance_and_index[0]
    index_closest_organism = organism_distance_and_index[1]
    angle_closest_organism = get_angle_to_closest_element(organism, organisms_in_view[index_closest_organism])



    input_values = {
        'EnergyLevel': organism.energy,
        'Temperature': get_temperature(),
        'Health': organism.health,
        'AngleToClosestFood': angle_closest_food,
        'DistToClosestFood': distance_closest_food,
        'NumOfFoodInView': vegetables_in_view.length,
        'AngleToClosestOrganism': angle_closest_organism,
        'DistToClosestOrganism': distance_closest_organism,
        'NumOfOrganismsInView': organisms_in_view.length,
        'Luminosity': get_luminosity(),
        'Maturity': organism.maturity,
        'TimeAlive': organism.get_time_alive_in_seconds()
    }
    return input_values
}

function get_distance_and_index_of_closest_element(organism: Organism, closests_elements: Point[]) {

    let min_distance = Infinity;
    let closest_index = -1;
    if(closests_elements.length !== 0){ // se a lista de organismos próximos não estiver vazia ele calcula, senão retorna o default
        for (let i = closests_elements.length - 1; i >= 0; i--) {
            let distance_x = organism.position.x - closests_elements[i].position.x
            let distance_y = organism.position.y - closests_elements[i].position.y
            let squared_distance =(distance_x*distance_x) + (distance_y*distance_y)
            if (squared_distance <= min_distance) {
                min_distance = squared_distance;
                closest_index = i;
            }
        }
    }
    if(min_distance == Infinity){
        min_distance = 0 // evitar cenários Infinity que quebram a rede
    }
    let distance_and_index: [number, number] = [min_distance, closest_index];
    return distance_and_index;
}

function get_angle_to_closest_element(organism: Organism, closest_element: Point){
    if(closest_element == null){
        return 0
    }
    const distance_x: number = closest_element.position.x - organism.position.x;
    const distance_y: number = closest_element.position.y - organism.position.y;

    const direction: Vector = new Vector(distance_x, distance_y);
    return direction.get_angle_to_another_vector(organism.speed)
}

let noise = 0

function get_temperature() {
    // Obtendo o valor de luminosidade atual, pois a temperatura estará diretamente relacionada à luminosidade
    const luminosity = get_luminosity();

    // Calculando a temperatura com base na luminosidade (5 quando a luminosidade for 0, e 30 quando for 1)
    let temperature = 5 + (25 * luminosity);

    // Mudando o valor do ruído em pequenos passos para que mude gradualmente a cada frame
    const noiseChange = (Math.random() * 2 - 1) * 0.5; // Muda o ruído em até ±0.5
    noise += noiseChange;
    noise = Math.max(Math.min(noise, 5), -5); // Garante que o ruído permaneça dentro dos limites de -5 a 5

    // Adicionando o ruído à temperatura
    temperature += noise;

    // Garantindo que a temperatura esteja dentro dos limites (0 a 35) após adicionar o ruído
    temperature = Math.max(Math.min(temperature, 35), 0);

    return temperature;
}

function get_luminosity() {
    // Convertendo o tempo de milissegundos (do global_timer.total) para segundos em um ciclo senoidal
    const cycle = (2 * Math.PI * global_timer.total / 1000) / globals.luminosity_cycle_time;

    // Calculando o valor senoidal e ajustando o ciclo para começar em 0.5
    const sinusoidal_value = Math.sin(cycle + Math.PI / 2);

    // Reescalando o valor para variar de 0 a 1 (ao invés de -1 a 1), que são os ranges da luminosidade
    const luminosity = (sinusoidal_value + 1) / 2;

    return luminosity;
}
