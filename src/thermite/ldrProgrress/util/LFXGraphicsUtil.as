//*********************************************************************************
//                                                                        
//         CARNEGIE MELLON UNIVERSITY PROPRIETARY INFORMATION             
//  
//  This software is supplied under the terms of a license agreement or   
//  nondisclosure agreement with Carnegie Mellon University and may not   
//  be copied or disclosed except in accordance with the terms of that   
//  agreement.    
//  
//   Copyright(c) 2011 Carnegie Mellon University. All Rights Reserved.   
//                                                                        
//  File:      CGraphicsUtil.as
//                                                                        
//  Purpose:   CGraphicsUtil Base class implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
// History: File Creation 4/29/2011
//                                                                        
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
//*********************************************************************************


package util 
{
	//** Imports
	
	import flash.display.*;
	import flash.geom.*;
	
	import mx.core.*;
	
	/**
	* ...
	*/
	public class LFXGraphicsUtil extends Object
	{
				
		/**
		* Creates a new CGraphicsUtil instance. 
		*/
		public function LFXGraphicsUtil() 
		{
		}
		
		// All Angles 0 and 1.  ratio of arc to full circle  (degrees / 360)
		// Internals use radians
		//
		// @@ todo - scale "steps" by dpi in some manner to ensure optimal performance / quality
		//
		public function drawArc(g:Graphics, originX:Number, originY:Number, radius:Number, arcOrg:Number, arcLen:Number, beginDraw:Boolean = true) : Point
		{		
			var xi:Number; 
			var xc:Number; 
			var yi:Number; 
			var yc:Number; 
			
			var fpoint:Point = new Point();
			var arcPos:Number;			
			var arcStep:Number;
			var stepCnt:int;
			var arcDelta:Number;
						
			var PIx2:Number = 2 * Math.PI;
			
			arcPos   = arcOrg * PIx2;
			arcDelta = arcLen * PIx2;			
			stepCnt  = Math.abs(arcDelta * 10);			
			arcStep  = (arcLen / stepCnt) * PIx2;
			
			xi = originX + (Math.cos(arcPos) * radius);
			yi = originY + (Math.sin(arcPos) * radius);
			
			if(beginDraw)
				g.moveTo(xi, yi);
			else 
				g.lineTo(xi, yi);
			
			// Draw a line to each point on the arc.
			
			for (var i1:int = 0 ; i1 < stepCnt ; i1++)
			{				
				// Increment the angle by "arcStep"
				
				arcPos += arcStep;
				
				xc = originX + Math.cos(arcPos) * radius;
				yc = originY + Math.sin(arcPos) * radius;
				
				g.lineTo(xc, yc);
			}
			
			fpoint.x = xc;
			fpoint.y = xc;
			
			return fpoint;
		}
		
		
		// All Angles 0 and 1.  ratio of arc to full circle  (degrees / 360)
		// Internals use radians
		//
		// @@ todo - scale "steps" by dpi in some manner to ensure optimal performance / quality
		//
		public function drawWedge(g:Graphics, originX:Number, originY:Number, radius:Number, arcOrg:Number, arcLen:Number, beginDraw:Boolean = true) : void
		{		
			
			g.moveTo(originX, originY);
			
			// Draw the arc
			
			drawArc(g, originX, originY, radius, arcOrg, arcLen, false);
			
			g.lineTo(originX, originY);			
		}
		
		
		// All Angles 0 and 1.  ratio of arc to full circle  (degrees / 360)
		// Internals use radians
		//
		// @@ todo - scale "steps" by dpi in some manner to ensure optimal performance / quality
		//
		public function drawAnnulusSegment(g:Graphics, originX:Number, originY:Number, iradius:Number, oradius:Number, arcOrg:Number, arcLen:Number) : Point
		{		
			//trace("X:" + originX + "Y:" + originY + "inner:" + iradius + "Outer:" + oradius + "Start:" + arcOrg + "ArcLen:" + arcLen);
			
			var xi:Number; 
			var xc:Number; 
			var yi:Number; 
			var yc:Number; 
			
			var fpoint:Point = new Point();
			var arcPos:Number;
			var arcDelta:Number;
			
			var PIx2:Number = 2 * Math.PI;
			
			arcPos   = arcOrg * PIx2;
			arcDelta = arcLen * PIx2;
			
			// Move to the inner radius at the start angle
			
			xi = originX + (Math.cos(arcPos) * iradius);
			yi = originY + (Math.sin(arcPos) * iradius);
			
			g.moveTo(xi, yi);			
			
			// Draw the outer arc
			
			fpoint = drawArc(g, originX, originY, oradius, arcOrg, arcLen, false);			
			
			// Draw the inner arc
			
			fpoint = drawArc(g, originX, originY, iradius, arcOrg + arcLen, -arcLen, false);
			
			return fpoint;
		}
		
	}
	
}