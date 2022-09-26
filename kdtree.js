k = 3072;
// k = 2;

class Node{
    constructor(point, axis, label){
    	this.point = point;
    	this.left = null;
    	this.right = null;
    	this.axis = axis;
		this.label = label; 
    }
}

function getHeight(node){
    if (node == null)
        return -1;
    else
    {
        /* Calcula la profundidad de cada árbol */
        let lDepth = getHeight(node.left);
        let rDepth = getHeight(node.right);

        /* Usa el más largo*/
        if (lDepth > rDepth)
            return (lDepth + 1);
        else
            return (rDepth + 1);
    }
}

function dot_nodes(node){
    g = '';
    if(node !== null)
    {
        g += this.dot_nodes(node.left);
        g += this.dot_nodes(node.right);
       
        if (node.left)
            g +=  '"' + node.point  + '"'+ ' -> ' + '"' + node.left.point + '";'
        if (node.right)
            g +=  '"' + node.point  + '"'+ ' -> ' + '"' + node.right.point + '";'
        return g;    
    }
    else
    {
        return '';
    }
}

function generate_dot(node){
    g =  dot_nodes(node);
    return 'digraph G {' + g + '}';
}

function build_kdtree(points, labels, depth = 0){
    var n = points.length;
    var axis = depth % k;
    
    if (n <= 0){
        return null;
    }

    if (n == 1)
    {
        return new Node(points[0], axis, labels[0])
    }

    var median = Math.floor(points.length / 2);
    
    points.sort(function(a, b)
    {
        return a[axis] - b[axis];
    });
    
    var left = points.slice(0, median);
    var right = points.slice(median + 1);
    
    var node = new Node(points[median].slice(0, k), axis, labels[median].slice(0, k));
    node.left = build_kdtree(left, labels.slice(0, median), depth + 1); 

    node.right = build_kdtree(right, labels.slice(median + 1), depth + 1);

    return node;
}

function distanceSquared (point1, point2){
    var distance = 0;
    for (var i = 0; i < k; i ++)
        distance += Math.pow (( point1 [i] - point2 [i]) , 2) ;
    return Math.sqrt (distance);
}

function closest_point_brute_force(points, point){
    dist_menor = 999999999999999;
    point_menor = [];
    for (var i = 0; i < points.length; i ++)
    {
        point_t = points[i];
        dist = distanceSquared (point_t, point);
        console.log(point_t + '|||' + dist);
        if (dist < dist_menor)
        {
            dist_menor = dist;
            point_menor = point_t;
        }
    }
    return point_menor;
}

function naive_closest_point(node, point, depth = 0, best = null){
	if (!node) 
        return best; 

    if(best==null || distanceSquared(best.point,point)>distanceSquared(node.point,point)){
        best = node;
    }

	if (node.point[node.axis] > point[node.axis])
	{
		if(node.left) 
            best = naive_closest_point(node.left,point,depth++,best);
	} 
	else
	{
		if(node.right) 
            best = naive_closest_point(node.right,point,depth++,best);
	}
	return best;
}

function closer_point(point,p1,p2){
	if(!p1) 
        return p2;
	if(!p2) 
        return p1;

	if(distanceSquared(point,p1.point) > distanceSquared(point,p2.point)) 
        return p2;
    else
	    return p1;
}

function closest_point(node, point_2, depth = 0){
	if (node == null) 
        return null; 
	var next_branch  = null;
	var opposite_branch  = null;
	if (node.point[node.axis] > point_2[node.axis])
	{
		next_branch  = node.left;
		opposite_branch  = node.right;
	} 
	else
	{
		next_branch  = node.right;
		opposite_branch  = node.left;
	}
	
	var best = closer_point(point_2,closer_point(point_2,closest_point(next_branch ,point_2,depth+1),node),best);
	
	if (distanceSquared(best.point,point_2) > Math.abs(point_2[node.axis] - node.point[node.axis]))
	{
		best2 = closer_point(point_2,closest_point(opposite_branch ,point_2,depth+1),node);
	}
	best = closer_point(point_2,best2,best);
	
	return best;	
}

function range_query_circle(node, center, radio, queue, depth = 0){
	if (node==null) return null;

	var axis = node.axis ;
	var nb = null;
	var ob = null;

	if (center[axis] < node.point[axis]){
		nb=node.left;
		ob=node.right;
	} else {
		nb=node.right;
		ob=node.left;
	}

	var best=closer_point(center,node,range_query_circle(nb,center,radio,queue,depth+1));

	if(Math.abs(center[axis]-node.point[axis]) <= radio || distanceSquared(center,best.point) > Math.abs(center[axis]-node.point[axis])){

		if(distanceSquared(center,node.point) <= radio){

			queue.push(node.point);
		}

		best=closer_point(center,best,range_query_circle(ob,center,radio,queue,depth+1));
	}

	return best ;
}
function range_query_rect(node, center, hug, queue, depth = 0){
    if(node==null) return null;
    
    var axis=node.axis;
    var nb=null;
    var ob=null;

    if(center[axis]<node.point[axis]){
        nb=node.left;
        ob=node.right;
    }else{
        nb=node.right;
        ob=node.left;
    }

    var best=closer_point(center, node, range_query_rect(nb,center,hug,queue, depth+1));

    if(Math.abs(center[axis]-node.point[axis])<=hug[axis]*2 || distanceSquared(center, best.point)>Math.abs(center[axis]-node.point[axis])){
        if(Math.abs(center[0]-node.point[0])<=hug[0] && Math.abs(center[1]-node.point[1])<=hug[1]){
            queue.push(node.point);
        }
        best=closer_point(center, best, range_query_rect(ob, center, hug, queue, depth+1));
    }
    return best;	
}

function deleteNode(arr, node)
{
        for(let i = 0; i < arr.length; i++)
	{
		if(JSON.stringify(arr[i]) === JSON.stringify(node.point))
		{ 
			arr.splice(i, 1);
			break;
		}
    	}
	return arr;
	
}

function KNN(data, labels, n, point) {
	datat = data;
    let neight = [];
    let root = build_kdtree(data, labels);

    for(let i = 0; i < n; ++i) {
        let closePoint = closest_point(root, point);
		delete root;
        neight.push(closePoint);
        rest = deleteNode(datat, closePoint);

        root = build_kdtree(datat, labels);
    }
    return neight;
}

module.exports = {Node, KNN, closest_point_brute_force, closest_point, generate_dot, build_kdtree, naive_closest_point, dot_nodes };