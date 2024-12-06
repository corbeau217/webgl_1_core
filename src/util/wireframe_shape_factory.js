import { Shape_Factory } from "./shape_factory.js";

export class Wireframe_Shape_factory extends Shape_Factory {

    
    /**
     * including it in our data
     * @param {*} first 
     * @param {*} second 
     */
    add_binding_edge(first,second){
        this.shape_data.vertex_bindings.push(first);
        this.shape_data.vertex_bindings.push(second);
        this.shape_data.face_count += 1;
    }

    /**
     * makes an edge, with colour and point size for it too
     * @param {*} first_pos 
     * @param {*} second_pos
     * @param {*} colour 
     * @param {*} first_size 
     * @param {*} second_size 
     */
    add_edge_with_colour_sizes( first_pos, second_pos, colour, first_size, second_size ){
        // keep where we're adding
        let starting_index = this.shape_data.vertex_count;
        // generate the vertices
        this.add_pos_colour_size( first_pos,  colour, first_size );
        this.add_pos_colour_size( second_pos, colour, second_size );
        // bind it
        this.add_binding_edge( starting_index, starting_index+1);
    }
}