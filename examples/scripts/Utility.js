class Utility {

    // Setup an Ik chain
    static createIkChain(skinnedMesh, createTarget, createConstraintConfig) {
        const chain = new IK.IKChain()
        const rootBone = Utility.getRootOfBone(skinnedMesh.skeleton.bones[0])
        Utility.growChainRecursive(rootBone, chain, createTarget, createConstraintConfig)
        return chain
    }

    static getRootOfBone(bone) {
        if (!bone || !bone.isBone)
            return null
        if (bone.parent && bone.parent.isBone)
            return Utility.getRootOfBone(bone.parent)
        return bone
    }

    // Adds a new joint to the chain
    static growChainRecursive(bone, chain, createTarget, createConstraintConfig) {
        const curriedGrowChain = (bone, chain) =>
            Utility.growChainRecursive(bone, chain,
                createTarget, createConstraintConfig)


        // Construct joint
        const constraintConfig = createConstraintConfig()
        const joint = new IK.IKJoint(bone, constraintConfig)
        const children = bone.children
        const targetConfig = {
            target: null
        }

        // add this joint to the chain
        if (children.length === 0) {
            const position = bone.getWorldPosition(new THREE.Vector3())
            targetConfig.target = createTarget(position)
        }
        chain.add(joint, targetConfig);

        // recurse based on the number of children
        switch (children.length) {
            case 0:
                break;
            case 1:
                curriedGrowChain(children[0], chain)
                break;
            default:
                for (let i = 0; i < children.length; i++) {
                    const child = children[i]
                    const subChain = new IK.IKChain()
                    subChain.add(joint)
                    chain.connect(subChain)
                    curriedGrowChain(child, subChain)
                }
        }
    }

    // A function that easily shows the bone weights
    createBoneWeightMap(skinnedMesh) {
        const geometry = skinnedMesh.geometry
        const vertices = geometry.vertices
        const weights = geometry.skinWeights
        const indicies = geometry.skinIndices
        const bones = skinnedMesh.skeleton.bones

        return vertices.map((v, i) => {
            const boneIndices = indicies[i]
            const boneWeights = weights[i]
            const boneWeightsMap = boneIndices
                .toArray()
                .filter(idx => 0 <= idx && idx < bones.length)
                .map(idx => {
                    const bone = bones[idx]
                    const weight = boneWeights.toArray()[idx]
                    return {
                        bone,
                        weight
                    }
                })
                .reduce((acc, val) => {
                    acc[val.bone.name] = val.weight
                    return acc
                }, {})

            return {
                point: {
                    x: v.x,
                    y: v.y,
                    z: v.z
                },
                weights: boneWeightsMap
            }
        })
    }
}