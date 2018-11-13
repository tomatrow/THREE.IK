class TestObjects {

    static Arm() {

        /// MARK: Construct and assign bone weights to mesh

        // Define the arm
        const geometry = new THREE.BoxGeometry(
            2, // width
            1, // height
            1, // depth
            2, // widthSegments
            1, // heightSegments
            1, // depthSegments
        );

        // apply weighting to box (the arm) vertices
        for (var i = 0; i < geometry.vertices.length; i++) {
            const vertex = geometry.vertices[i]

            let shoulderWeight = 0
            let elbowWeight = 0
            let handWeight = 0
            // It's a a box with twelve verticies.
            if (vertex.x > 0)
                shoulderWeight = 1
            else if (vertex.x == 0)
                // this is the middle
                shoulderWeight = 1
            else // vertex.x < 0
                elbowWeight = 1


            // indexes of up to four bones, the last index does not matter since we only have three bones.
            geometry.skinIndices.push(new THREE.Vector4(0, 1, 2, -1))
            // the weights assigned to those bones for this vertex
            geometry.skinWeights.push(new THREE.Vector4(shoulderWeight, elbowWeight, handWeight, 0))
        }

        const material = new THREE.MeshNormalMaterial({
            skinning: true
        });

        const armMesh = new THREE.SkinnedMesh(geometry, material);

        /// MARK: Construct and attach armature

        // Construct bones
        const bones = [];
        const makeBone = (name, dx, parent) => {
            const bone = new THREE.Bone()
            bone.name = name
            bone.position.x = dx
            if (parent)
                parent.add(bone)
            bones.push(bone)
            return bone
        }
        const shoulderBone = makeBone('shoulder', 1, null)
        const elbowBone = makeBone('elbow', -1, shoulderBone)
        const handBone = makeBone('hand', -1, elbowBone)
        const rootBone = bones[0]

        // Attach armature to mesh
        armMesh.add(rootBone);
        const armSkeleton = new THREE.Skeleton(bones);
        armMesh.bind(armSkeleton);

        return armMesh
    }
}