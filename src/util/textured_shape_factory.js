import { Shape_Factory } from "./shape_factory.js";


export class Textured_Shape_Factory extends Shape_Factory {
    /**
     * extension of parent function to include the texture coordinates
     */
    constructor(){
        super();
        /**
         * shape information container to be used by Drawable_Scene_Object
         */
        this.shape_data = {
            // ------------------------
            vertex_positions: [],
            vertex_bindings: [],
            vertex_colours: [],
            vertex_sizes: [],
            vertex_normals: [],
            vertex_uv_mappings: [],
            // ------------------------
            vertex_count: 0,
            edge_count: 0,
            face_count: 0,
            // ------------------------
            colour_count: 0,
            size_count: 0,
            normal_count: 0,
            uv_mapping_count: 0,
            // ------------------------
        };
    }
    /**
     * include it in our data
     * @param {*} uv_mapping 
     */
    add_texture_coordinates( uv_mapping ){
        // colour first
        this.shape_data.vertex_uv_mappings.push(uv_mapping.u);
        this.shape_data.vertex_uv_mappings.push(uv_mapping.v);
        this.shape_data.uv_mapping_count += 1;
    }
    /**
     * does all for a point, but concisely with data given where the layout is:
     * ```
     * data = {
     *  position: { x: number, y: number, z: number, w: number },
     *  colour: { r: number, g: number, b: number, a: number },
     *  size: number,
     *  uv_mapping: { u: number, v: number },
     * }
     * ```
     * @param {*} vertex_data
     */
    add_pos_with_data( vertex_data ){
        this.add_pos_colour_size( vertex_data.position, vertex_data.colour, vertex_data.size );
        this.add_texture_coordinates(vertex_data.uv_mapping);
    }

    /**
     * add face with data given for each point where the layout is:
     * ```
     * data = {
     *  position: { x: number, y: number, z: number, w: number },
     *  colour: { r: number, g: number, b: number, a: number },
     *  size: number,
     *  uv_mapping: { u: number, v: number },
     * }
     * ```
     * 
     * @param {*} first_data 
     * @param {*} second_data 
     * @param {*} third_data 
     */
    add_face_with_data( first_data, second_data, third_data ){
        // keep where we're adding
        let starting_index = this.shape_data.vertex_count;
        // generate the vertices
        this.add_pos_with_data( first_data  );
        this.add_pos_with_data( second_data );
        this.add_pos_with_data( third_data  );
        // bind it
        this.add_binding_face( starting_index, starting_index+1, starting_index+2);
        // add the normals for it
        this.add_normals_for_face( first_data.position, second_data.position, third_data.position );
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * 
     * for adding two triangles to make a quad with data given for each point where the layout is:
     * ```
     * data = {
     *  position: { x: number, y: number, z: number, w: number },
     *  colour: { r: number, g: number, b: number, a: number },
     *  size: number,
     *  uv_mapping: { u: number, v: number },
     * }
     * ```
     * 
     * data for points is provided in clockwise order regardless of the face winding
     * 
     * @param {*} first_data 
     * @param {*} second_data 
     * @param {*} third_data 
     * @param {*} fourth_data 
     * @param {*} clockwise_face_winding to determine the order of face creation
     */
    add_quad_with_data( first_data, second_data, third_data, fourth_data, clockwise_face_winding ){
        if(clockwise_face_winding){
            this.add_face_with_data( first_data, second_data, third_data );
            this.add_face_with_data( first_data, third_data, fourth_data );
        }
        else {
            this.add_face_with_data( first_data, third_data, second_data );
            this.add_face_with_data( first_data, fourth_data, third_data );
        }
    }
    /**
     * 
     * for adding a single triangle with data given for each point where the layout is:
     * ```
     * data = {
     *  position: { x: number, y: number, z: number, w: number },
     *  colour: { r: number, g: number, b: number, a: number },
     *  size: number,
     *  uv_mapping: { u: number, v: number },
     * }
     * ```
     * 
     * data for points is provided in clockwise order regardless of the face winding
     * 
     * @param {*} first_data 
     * @param {*} second_data 
     * @param {*} third_data 
     * @param {*} clockwise_face_winding to determine the order of face creation
     */
    add_triangle_with_data( first_data, second_data, third_data, clockwise_face_winding ){
        if(clockwise_face_winding){
            this.add_face_with_data( first_data, second_data, third_data );
        }
        else {
            this.add_face_with_data( first_data, third_data, second_data );
        }
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

}