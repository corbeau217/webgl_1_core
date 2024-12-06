

export class Shape_Factory {
    constructor(){
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
            // ------------------------
            vertex_count: 0,
            edge_count: 0,
            face_count: 0,
            // ------------------------
            colour_count: 0,
            size_count: 0,
            normal_count: 0,
            // ------------------------
        };
    }





    /**
     * included in our data
     * @param {*} vertex_data 
     */
    add_vertex_position(vertex_data){
        this.shape_data.vertex_positions.push(vertex_data.x);
        this.shape_data.vertex_positions.push(vertex_data.y);
        this.shape_data.vertex_positions.push(vertex_data.z);
        this.shape_data.vertex_positions.push(1.0);
        
        this.shape_data.vertex_count += 1;
    }
    /**
     * including it in our data
     * @param {*} first 
     * @param {*} second 
     * @param {*} third 
     */
    add_binding_face(first,second,third){
        this.shape_data.vertex_bindings.push(first);
        this.shape_data.vertex_bindings.push(second);
        this.shape_data.vertex_bindings.push(third);
        this.shape_data.face_count += 1;
    }
    /**
     * including it in our data
     * @param {*} colour 
     * @param {*} size 
     */
    add_colour_and_size(colour, size){
        // colour first
        this.shape_data.vertex_colours.push(colour.r);
        this.shape_data.vertex_colours.push(colour.g);
        this.shape_data.vertex_colours.push(colour.b);
        this.shape_data.vertex_colours.push(colour.a);
        this.shape_data.colour_count += 1;

        // then size
        this.shape_data.vertex_sizes.push(size);
        this.shape_data.size_count += 1;
    }
    /**
     * does all for a point, but concisely
     * @param {*} pos 
     * @param {*} colour 
     * @param {*} size 
     */
    add_pos_colour_size(pos,colour,size){
        this.add_vertex_position(pos);
        this.add_colour_and_size(colour,size);
    }

    /**
     * takes vec3 and includes it as a normal for our shape
     * @param {*} normal_vec3 
     */
    add_normal(normal_vec3){
        this.shape_data.vertex_normals.push(normal_vec3[0]);
        this.shape_data.vertex_normals.push(normal_vec3[1]);
        this.shape_data.vertex_normals.push(normal_vec3[2]);
        this.shape_data.normal_count += 1;
    }
    /**
     * converts the position data to two vec3s then does a cross product
     *  to get the perpendicular vector to the plane that all 3 vertices
     *  exist on
     * 
     * @param {*} first_pos 
     * @param {*} second_pos 
     * @param {*} third_pos 
     * @returns vec3 perpendicular vector
     */
    normal_vec3_from_face_vertices( first_pos, second_pos, third_pos ){
        // prepare the positions as vec3
        let first_vec = vec3.fromValues( first_pos.x, first_pos.y, first_pos.z );
        let second_vec = vec3.fromValues( second_pos.x, second_pos.y, second_pos.z );
        let third_vec = vec3.fromValues( third_pos.x, third_pos.y, third_pos.z );
        // ready the vectors for the math library
        let left_vec = vec3.create();
        let right_vec = vec3.create();
        let cross_vec = vec3.create();

        // --- vector math ---

        // (static) subtract(out, a, b) → {vec3}
        // Subtracts vector b from vector a 

        // get the two vectors
        vec3.subtract(left_vec, second_vec, first_vec);
        vec3.subtract(right_vec, second_vec, third_vec);

        // (static) cross(out, a, b) → {vec3}
        // Computes the cross product of two vec3's 
        
        // CLOCKWISE / right-handed coordinate frame
        vec3.cross(cross_vec, left_vec, right_vec);

        // // ANTICLOCKWISE / left-handed coordinate frame
        // vec3.cross(cross_vec, right_vec, left_vec);

        // --- give ---
        return cross_vec;
    }
    /**
     * determine the normal, then provide it
     * @param {*} first_pos 
     * @param {*} second_pos 
     * @param {*} third_pos 
     */
    add_normals_for_face(first_pos, second_pos, third_pos){
        // generate the normal
        let face_normal = this.normal_vec3_from_face_vertices(first_pos, second_pos, third_pos);

        // add as normal for each of the triangle's/face's vertices
        this.add_normal(face_normal);
        this.add_normal(face_normal);
        this.add_normal(face_normal);
    }
    /**
     * makes a triangle/face including the normal vector, with colour and point size for it too
     * @param {*} first_pos 
     * @param {*} second_pos 
     * @param {*} third_pos 
     * @param {*} colour 
     * @param {*} size 
     */
    add_face_with_colour_size( first_pos, second_pos, third_pos, colour, size ){
        // keep where we're adding
        let starting_index = this.shape_data.vertex_count;
        // generate the vertices
        this.add_pos_colour_size( first_pos,  colour, size );
        this.add_pos_colour_size( second_pos, colour, size );
        this.add_pos_colour_size( third_pos,  colour, size );
        // bind it
        this.add_binding_face( starting_index, starting_index+1, starting_index+2);
        // add the normals for it
        this.add_normals_for_face( first_pos, second_pos, third_pos );
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * for adding two triangles to make a quad
     * 
     * points are supplied in clockwise order regardless of the winding order of the program,
     *  `clockwise_face_winding` is where the ordering is determined for the shape
     * @param {*} first_pos 
     * @param {*} second_pos 
     * @param {*} third_pos 
     * @param {*} fourth_pos 
     * @param {*} colour 
     * @param {*} size 
     * @param {*} clockwise_face_winding 
     */
    add_quad_with_colour_size( first_pos, second_pos, third_pos, fourth_pos, colour, size, clockwise_face_winding ){
        if(clockwise_face_winding){
            this.add_face_with_colour_size( first_pos, second_pos, third_pos, colour, size );
            this.add_face_with_colour_size( first_pos, third_pos, fourth_pos, colour, size );
        }
        else {
            this.add_face_with_colour_size( first_pos, third_pos, second_pos, colour, size );
            this.add_face_with_colour_size( first_pos, fourth_pos, third_pos, colour, size );
        }
    }
    /**
     * for making a face but with determining the winding order
     * 
     * points are supplied in clockwise order regardless of the winding order of the program,
     *  `clockwise_face_winding` is where the ordering is determined for the shape
     * @param {*} first_pos 
     * @param {*} second_pos 
     * @param {*} third_pos 
     * @param {*} colour 
     * @param {*} size 
     * @param {*} clockwise_face_winding 
     */
    add_triangle_with_colour_size( first_pos, second_pos, third_pos, colour, size, clockwise_face_winding ){
        if(clockwise_face_winding){
            this.add_face_with_colour_size( first_pos, second_pos, third_pos, colour, size );
        }
        else {
            this.add_face_with_colour_size( first_pos, third_pos, second_pos, colour, size );
        }
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * does all for a point, but concisely with data given where the layout is:
     * ```
     * data = {
     *  position: { x: number, y: number, z: number, w: number },
     *  colour: { r: number, g: number, b: number, a: number },
     *  size: number,
     * }
     * ```
     * @param {*} vertex_data
     */
    add_pos_with_data( vertex_data ){
        this.add_pos_colour_size( vertex_data.position, vertex_data.colour, vertex_data.size );
    }

    /**
     * add face with data given for each point where the layout is:
     * ```
     * data = {
     *  position: { x: number, y: number, z: number, w: number },
     *  colour: { r: number, g: number, b: number, a: number },
     *  size: number,
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