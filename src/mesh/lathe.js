

export class Lathe {
    constructor( lathe_data ){
        this.data = lathe_data;
        this.initialise();
        this.build_mesh();
    }
    initialise(){
        this.vertices = [];
        this.vertex_count = 0;
        this.bindings = [];
        this.face_count = 0;
        this.normals = [];
        this.normal_count = 0;
        this.colours = [];

        this.clockwise_winding = false;

        const sqrt_of_3 = 1.73205080757;
        this.unit_circle_points = [
            { x: 1.0,              y: 0.0             },
            { x: sqrt_of_3/2.0,    y: 0.5             },
            { x: 0.5,              y: sqrt_of_3/2.0   },
            { x: 0.0,              y: 1.0             },
            { x: -0.5,             y: sqrt_of_3/2.0   },
            { x: -sqrt_of_3/2.0,   y: 0.5             },
            { x: -1.0,             y: 0.0             },
            { x: -sqrt_of_3/2.0,   y: -0.5            },
            { x: -0.5,             y: -sqrt_of_3/2.0  },
            { x: 0.0,              y: -1.0            },
            { x: 0.5,              y: -sqrt_of_3/2.0  },
            { x: sqrt_of_3/2.0,    y: -0.5            },
        ];
    }
    build_mesh(){

        // add the first and last points
        // also include the colour
        this.add_vertex( 0.0, 0.0, this.data.first_point.position_z, 1.0 );
        this.add_colour( this.data.first_point.colour );
        this.add_vertex( 0.0, 0.0, this.data.last_point.position_z, 1.0 );
        this.add_colour( this.data.last_point.colour );
        
        // to reference the points we just made
        const first_point_index = 0;
        const end_point_index = 1;
        
        // this is for short hand referencing
        let slice_count = this.unit_circle_points.length;
        let plate_count = this.data.body_points.length;


        // each slice, we build the vertices
        for (let slice_index = 0; slice_index < slice_count; slice_index++) {
            
            // wrap finding our next slice index
            let next_slice_index = (slice_index+1) % slice_count;
            
            // prepare the starting vertex offset for each slice
            let current_slice_start = (slice_index * plate_count) + 2;
            let next_slice_start = (next_slice_index * plate_count) + 2;
            
            // first face of the slice connecting to the first vertex
            // --- clockwise
            if(this.clockwise_winding){
                this.add_face( first_point_index, current_slice_start, next_slice_start );
            }
            // --- anticlockwise
            else {
                this.add_face( first_point_index, next_slice_start, current_slice_start );
            }

            // quickly make the first vertex so we can skip checking each time
            this.add_vertex(
                this.unit_circle_points[slice_index].x * this.data.body_points[0].radius,
                this.unit_circle_points[slice_index].y * this.data.body_points[0].radius,
                this.data.body_points[0].position_z,
                1.0
            );

            // also include the current colour
            this.add_colour( this.data.body_points[0].colour );

            // now make each vertex along the current slice
            //      SKIP THE FIRST PLATE BECAUSE ALREADY DONE
            for (let plate_index = 1; plate_index < plate_count; plate_index++) {
                // make the current vertex
                this.add_vertex(
                    this.unit_circle_points[slice_index].x * this.data.body_points[plate_index].radius,
                    this.unit_circle_points[slice_index].y * this.data.body_points[plate_index].radius,
                    this.data.body_points[plate_index].position_z,
                    1.0
                );

                // also include the current colour
                this.add_colour( this.data.body_points[plate_index].colour );

                // points of the current quad
                const current_slice_previous_vertex_index = current_slice_start+plate_index-1;
                const current_slice_current_vertex_index = current_slice_start+plate_index;
                const next_slice_previous_vertex_index = next_slice_start+plate_index-1;
                const next_slice_current_vertex_index = next_slice_start+plate_index;
                
                // also add the faces connecting
                // --- clockwise
                if(this.clockwise_winding){
                    this.add_face( current_slice_previous_vertex_index, current_slice_current_vertex_index, next_slice_current_vertex_index );
                    this.add_face( current_slice_previous_vertex_index, next_slice_current_vertex_index, next_slice_previous_vertex_index );
                }
                // --- anticlockwise
                else {
                    this.add_face( current_slice_previous_vertex_index, next_slice_current_vertex_index, current_slice_current_vertex_index );
                    this.add_face( current_slice_previous_vertex_index, next_slice_previous_vertex_index, next_slice_current_vertex_index );
                }
            }


            // now do the last face connecting to last vertex
            //  last vertex uses index 1
            // --- clockwise
            if(this.clockwise_winding){
                this.add_face( end_point_index, next_slice_start+(plate_count-1), current_slice_start+(plate_count-1) );
            }
            // --- anticlockwise
            else {
                this.add_face( end_point_index, current_slice_start+(plate_count-1), next_slice_start+(plate_count-1) );
            }
        }
        this.build_normals();

        console.log(`done with ${this.vertex_count} vertices, and ${this.face_count} faces`);
    }
    build_normals(){
        // ...
    }
    add_face(first_binding_index, second_binding_index, third_binding_index ){
        // add in order, they deal with the ordering
        this.bindings.push(first_binding_index);
        this.bindings.push(second_binding_index);
        this.bindings.push(third_binding_index);
        // count this one
        this.face_count += 1;
    }
    add_vertex(position_x, position_y, position_z, position_w){
        this.vertices.push(position_x);
        this.vertices.push(position_y);
        this.vertices.push(position_z);
        this.vertices.push(position_w);
        this.vertex_count += 1;

        // lazy do the normal
        this.add_normal(position_x, position_y, position_z);
    }
    add_normal(position_x, position_y, position_z){
        this.normals.push(position_x);
        this.normals.push(position_y);
        this.normals.push(position_z);
    }
    add_colour( rbg_json ){
        this.colours.push(rbg_json.r);
        this.colours.push(rbg_json.g);
        this.colours.push(rbg_json.b);
        this.colours.push( 1.0 );
    }
}