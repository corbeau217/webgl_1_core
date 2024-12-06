// ############################################################################################
// ############################################################################################
// ############################################################################################

import { Perspective_Camera } from "./perspective_camera.js";

const TAU = 2.0*Math.PI;

// ############################################################################################
// ############################################################################################
// ############################################################################################

export class Orbital_Perspective_Camera extends Perspective_Camera {
    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * used for initalising matrices and large setting information
     *      function calls are fine but should be limited as
     *      bloating this could cause excessive object creation
     *      overhead if we're creating and destroying objects often
     * 
     * this is where attribute locations are determined and the model shape is made
     *      which is handled by their respective functions
     */
    initialise_on_event(){
        super.initialise_on_event();

        // new vector for our rotation
        this.rotation_speed = vec3.fromValues(0.0, 0.6, 0.0);
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! replacement !!
     * 
     * @returns view matrix of the camera
     */
    get_view_matrix(){
        mat4.identity(this.view_matrix);

        mat4.translate(
            this.view_matrix,
            this.view_matrix,
            this.translation,
        );

        // (static) multiply(out, a, b) → {mat4}
        mat4.multiply(this.view_matrix, this.view_matrix, this.rotation_matrix);


        // give back view matrix
        return this.view_matrix;
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * operations performed on this object each frame with respect to the time scale provided
     *      by `delta_time` parameter
     */
    update_self( delta_time ){
        super.update_self( delta_time );

        // (static) clone(a) → {vec3}
        // Creates a new vec3 initialized with values from an existing vector 
        
        // (static) scale(out, a, b) → {vec3}
        // Scales a vec3 by a scalar number 

        // (static) add(out, a, b) → {vec3}
        // Adds two vec3's 

        // get speed
        let rotation_factor_vec3 = vec3.clone(this.rotation_speed);
        // scale by time scale
        vec3.scale(rotation_factor_vec3, rotation_factor_vec3, delta_time);

        this.rotate_local( rotation_factor_vec3 );
    }
}

// ############################################################################################
// ############################################################################################
// ############################################################################################
