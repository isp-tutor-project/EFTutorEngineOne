//*********************************************************************************
//
// The MIT License (MIT)
//
// Copyright(c) 2012 Kevin Willows. All Rights Reserved.   
//                                                                        
// Permission is hereby granted, free of charge, to any person obtaining a copy of 
// this software and associated documentation files (the "Software"), to deal in the 
// Software without restriction, including without limitation the rights to use, 
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
// Software, and to permit persons to whom the Software is furnished to do so, subject 
// to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all 
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//  
//  File:      LFXAnnulusElement.as
//                                                                        
//  Purpose:   LFXAnnulusElement Flex Implementation
//                                                                        
//  Author(s): Kevin Willows                                                           
//  
//  History: File Creation Feb 06 2012  
//
//*********************************************************************************


package primitives
{
	//## imports
	
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	
	import mx.core.mx_internal;
	import mx.utils.MatrixUtil;
	
	import spark.primitives.supportClasses.FilledElement;
	
	import util.*;
	
	use namespace mx_internal;
	
	/**
	 *  The LFXLdrAnnulus class is a filled graphic element that draws an set of annuli for a loader visualization.
	 *  
	 *  
	 *  @langversion 3.0
	 *  @playerversion Flash 10
	 *  @playerversion AIR 1.5
	 *  @productversion Flex 4
	 */
	public class LFXAnnulusElement extends FilledElement
	{
		private var _numSegments:int = 0;			
		private var _loadSegment:int = 0;		
		private var _ratio:Number    = 0;
		
		private var _majorRatio:Number = 0.20;
		private var _minorRatio:Number = 0.20;
		private var _gapRatio:Number   = 0.05;		
		
		private var _majLineClrNml:int		= 0x222222; 
		private var _majLineAlphaNml:Number	= 0.4;
		private var _majLineClrHlt:int		= 0x000000; 
		private var _majLineAlphaHlt:Number	= 0.4; 
		private var _majFillClrNml:int	  	= 0x222222;	 
		private var _majFillAlphaNml:Number	= 0.8; 
		private var _majFillClrHlt:int		= 0x444444; 
		private var _majFillAlphaHlt:Number	= 0.8;
		
		private var _minLineClrNml:int		= 0x222222; 
		private var _minLineAlphaNml:Number	= 0.4;
		private var _minLineClrHlt:int		= 0x000000; 
		private var _minLineAlphaHlt:Number	= 0.4; 
		private var _minFillClrNml:int	  	= 0x444444;	 
		private var _minFillAlphaNml:Number	= 0.4; 
		private var _minFillClrHlt:int		= 0x222222; 
		private var _minFillAlphaHlt:Number	= 0.4;
		
		
		private var Srings:Vector.<LFXAnnulus>;

		
		//--------------------------------------------------------------------------
		//
		//  Constructor
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  Constructor. 
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 10
		 *  @playerversion AIR 1.5
		 *  @productversion Flex 4
		 */
		public function LFXAnnulusElement()
		{
			super();
		}
		
		//--------------------------------------------------------------------------
		//
		//  Properties
		//
		//--------------------------------------------------------------------------

		public function set numSegments(newValue:int) : void
		{
			_numSegments = newValue;
			
			invalidateProperties();
			
			//			if (!drawnDisplayObject || !(drawnDisplayObject is Sprite))
			//				return;
			//			
			//			// The base GraphicElement class has cleared the graphics for us.    
			//			var g:Graphics = (drawnDisplayObject as Sprite).graphics;
		}
		
		public function get numSegments() : int
		{
			return _numSegments;
		}
		
		
		public function set loadSegment(newValue:int) : void
		{
			_loadSegment = newValue;

			invalidateProperties();
			
//			if (!drawnDisplayObject || !(drawnDisplayObject is Sprite))
//				return;
//			
//			// The base GraphicElement class has cleared the graphics for us.    
//			var g:Graphics = (drawnDisplayObject as Sprite).graphics;
		}
		
		public function get loadSegment() : int
		{
			return _loadSegment;
		}
		
		
		public function set ratio(newValue:Number) : void
		{
			_ratio = newValue;

			invalidateProperties();
			
//			if (!drawnDisplayObject || !(drawnDisplayObject is Sprite))
//				return;
//			
//			// The base GraphicElement class has cleared the graphics for us.    
//			var g:Graphics = (drawnDisplayObject as Sprite).graphics;
		}

		
		/**
		 * This is an optimization - we could do the update in the updateDisplayList by
		 * issuing a invalidateDisplayList whenever the properties changed - but 
		 * that would require rebuilding the Srings everytime.  Doing it this way allows 
		 * the existing Annulus objects to redraw while update only their parameters. 
		 * 
		 */
		override protected function commitProperties():void 
		{
			
			// Note: it is in the super.commit where the new skin state is set
			
			super.commitProperties();

			if(Srings)
			{
				Srings[0].highLightSegment(_loadSegment);
				Srings[1].arcLength = _ratio;			
	
				// Draw the update
				
				if (!drawnDisplayObject || !(drawnDisplayObject is Sprite))
					return;
				
				var g:Graphics = (drawnDisplayObject as Sprite).graphics;
				
				beginDraw(g);
				draw(g);
				endDraw(g);
			}
		}		
		
		
		//--------------------------------------------------------------------------
		//
		//  Overridden methods
		//
		//--------------------------------------------------------------------------
		
		/**
		 *  Draws the element and/or sizes and positions its content.
		 *  This is an advanced method that you might override
		 *  when creating a subclass of GraphicElement.
		 *
		 *  <p>You do not call this method directly. Flex calls the
		 *  <code>updateDisplayList()</code> method when the component is added 
		 *  to an <code>IGraphicElementContainer</code> container such as Group
		 *  using the <code>addElement()</code> method, and when the element's
		 *  <code>invalidateDisplayList()</code> method is called. </p>
		 *
		 *  <p>This method is where you would do programmatic drawing
		 *  using methods on the elements's displayObject
		 *  such as <code>graphics.drawRect()</code>.</p>
		 *
		 *  @param unscaledWidth Specifies the width of the component, in pixels,
		 *  in the component's coordinates, regardless of the value of the
		 *  <code>scaleX</code> property of the component.
		 
		 *  @param unscaledHeight Specifies the height of the component, in pixels,
		 *  in the component's coordinates, regardless of the value of the
		 *  <code>scaleY</code> property of the component.
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 10
		 *  @playerversion AIR 1.5
		 *  @productversion Flex 4
		 */
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void
		{
			if (!drawnDisplayObject || !(drawnDisplayObject is Sprite))
				return;

			// Calc the center point of the Annulus - it draws relative to center not upper left corner (drawX, drawY)
			
			var rad:Number = unscaledWidth  / 2;
			
			var cenX:Number = drawX + rad;
			var cenY:Number = drawY + rad;
			
			// There are 2 annuli - One for the major count "M" (i.e. files to be loaded) and one for minor count "m" (file load progress)
			
			// Their sizes are determined as a proportion of the annulus radius.  
			// There is a gap between them sized as a proportion of the annulus radius.
			 
			var radMOuter:Number = rad; 
			var radMInner:Number = radMOuter - (rad * _majorRatio);

			var gap:Number = radMInner - (rad * _gapRatio);

			var radmOuter:Number = gap; 
			var radmInner:Number = radmOuter - (rad * _minorRatio);
			
			// Clear any existing rings - and add what we need
			
			Srings = new Vector.<LFXAnnulus>; 
			
			// We draw the inner fill and border separately so the bar is always visible
			
			addRing("outer",	 _numSegments, cenX, cenY,  radMInner, radMOuter, _majLineClrNml, _majLineAlphaNml, _majLineClrHlt, _majLineAlphaHlt, _majFillClrNml, _majFillAlphaNml, _majFillClrHlt, _majFillAlphaHlt );   	
			addRing("innerFill", 	        1, cenX, cenY,  radmInner, radmOuter, 0x000000, 0.0, 0x000000, 0.0, _minFillClrNml, _minFillAlphaNml, _minFillClrHlt, _minFillAlphaHlt);   	
			addRing("innerBorder",          1, cenX, cenY,  radmInner, radmOuter, _minLineClrNml, _minLineAlphaNml, _minLineClrHlt, _minLineAlphaHlt, 0x000000, 0.0, 0x000000, 0.0);   	
			
			Srings[0].highLightSegment(_loadSegment);
			Srings[1].arcLength = _ratio;			

			// The base GraphicElement class has cleared the graphics for us.    
			var g:Graphics = (drawnDisplayObject as Sprite).graphics;
			
			beginDraw(g);
			draw(g);
			endDraw(g);
		}
				
		
		private function addRing(_id:String, _numSegments:int, 
								 _centerX:Number, _centerY:Number, 
								 _radiusIn:Number, _radiusOut:Number, 
								 _outlineClrNml:int, _outlineAlphaNml:Number, 
								 _outlineClrHlt:int, _outlineAlphaHlt:Number, 
								 _fillClrNml:int, _fillAlphaNml:Number, 
								 _fillClrHlt:int, _fillAlphaHlt:Number ) : void
		{		
			var newRing:LFXAnnulus = new LFXAnnulus;
			
			newRing.id          = _id
			newRing.numSegments = _numSegments; 
			
			newRing.centerX   = _centerX;
			newRing.centerY   = _centerY; 
			newRing.radiusOut = _radiusOut;
			newRing.radiusIn  = _radiusIn;
			
			newRing.outlineClrNml   = _outlineClrNml;
			newRing.outlineAlphaNml = _outlineAlphaHlt;
			newRing.outlineClrHlt   = _outlineClrHlt
			newRing.outlineAlphaHlt = _outlineAlphaHlt;
			
			newRing.fillClrNml      = _fillClrNml;
			newRing.fillAlphaNml    = _fillAlphaNml;
			newRing.fillClrHlt      = _fillClrHlt;
			newRing.fillAlphaHlt    = _fillAlphaHlt;
			
			Srings.push(newRing);
		}
		
		
		override protected function draw(g:Graphics) : void
		{
			var ring:LFXAnnulus;			
			
			super.draw(g);
			
			for each (ring in Srings)
			{
				ring.drawRing(g);
			}			
		}
		
		override protected function beginDraw(g:Graphics): void
		{			
			super.beginDraw(g);
			
			g.clear();
		}
		
		override protected function endDraw(g:Graphics) : void
		{
			super.endDraw(g);			
		}
		

		
		/**
		 *  @private
		 */
		override protected function transformWidthForLayout(width:Number,
															height:Number,
															postLayoutTransform:Boolean = true):Number
		{
			if (postLayoutTransform && hasComplexLayoutMatrix)
				width = MatrixUtil.getEllipseBoundingBox(width / 2, height / 2, width / 2, height / 2, 
					layoutFeatures.layoutMatrix).width;    
			
			// Take stroke into account
			return width + getStrokeExtents(postLayoutTransform).width;
		}
		
		/**
		 *  @private
		 */
		override protected function transformHeightForLayout(width:Number,
															 height:Number,
															 postLayoutTransform:Boolean = true):Number
		{
			if (postLayoutTransform && hasComplexLayoutMatrix)
				height = MatrixUtil.getEllipseBoundingBox(width / 2, height / 2, width / 2, height / 2, 
					layoutFeatures.layoutMatrix).height;
			
			// Take stroke into account
			return height + getStrokeExtents(postLayoutTransform).height;
		}
		
		/**
		 *  @inheritDoc
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 10
		 *  @playerversion AIR 1.5
		 *  @productversion Flex 4
		 */
		override public function getBoundsXAtSize(width:Number, height:Number, postLayoutTransform:Boolean = true):Number
		{
			var strokeExtents:Rectangle = getStrokeExtents(postLayoutTransform);
			var m:Matrix = getComplexMatrix(postLayoutTransform);
			if (!m)
				return strokeExtents.left + this.x;
			
			if (!isNaN(width))
				width -= strokeExtents.width;
			if (!isNaN(height))
				height -= strokeExtents.height;
			
			// Calculate the width and height pre-transform:
			var newSize:Point = MatrixUtil.fitBounds(width, height, m,
				explicitWidth, explicitHeight,
				preferredWidthPreTransform(),
				preferredHeightPreTransform(),
				minWidth, minHeight,
				maxWidth, maxHeight);
			if (!newSize)
				newSize = new Point(minWidth, minHeight);
			
			return strokeExtents.left + 
				MatrixUtil.getEllipseBoundingBox(newSize.x / 2, newSize.y / 2, newSize.x / 2, newSize.y / 2, m).x;
		}
		
		/**
		 *  @inheritDoc
		 *  
		 *  @langversion 3.0
		 *  @playerversion Flash 10
		 *  @playerversion AIR 1.5
		 *  @productversion Flex 4
		 */
		override public function getBoundsYAtSize(width:Number, height:Number, postLayoutTransform:Boolean = true):Number
		{
			var strokeExtents:Rectangle = getStrokeExtents(postLayoutTransform);
			var m:Matrix = getComplexMatrix(postLayoutTransform);
			if (!m)
				return strokeExtents.top + this.y;
			
			if (!isNaN(width))
				width -= strokeExtents.width;
			if (!isNaN(height))
				height -= strokeExtents.height;
			
			// Calculate the width and height pre-transform:
			var newSize:Point = MatrixUtil.fitBounds(width, height, m,
				explicitWidth, explicitHeight,
				preferredWidthPreTransform(),
				preferredHeightPreTransform(),
				minWidth, minHeight,
				maxWidth, maxHeight);
			if (!newSize)
				newSize = new Point(minWidth, minHeight);
			
			return strokeExtents.top + 
				MatrixUtil.getEllipseBoundingBox(newSize.x / 2, newSize.y / 2, newSize.x / 2, newSize.y / 2, m).y;
		}
		
		/**
		 *  @private
		 */
		override public function getLayoutBoundsX(postLayoutTransform:Boolean = true):Number
		{
			var stroke:Number = getStrokeExtents(postLayoutTransform).left;
			
			if (postLayoutTransform && hasComplexLayoutMatrix)
				return stroke + MatrixUtil.getEllipseBoundingBox(width / 2, height / 2, width / 2, height / 2, 
					layoutFeatures.layoutMatrix).x;
			
			return stroke + this.x;
		}
		
		/**
		 *  @private
		 */
		override public function getLayoutBoundsY(postLayoutTransform:Boolean = true):Number
		{
			var stroke:Number = getStrokeExtents(postLayoutTransform).top;
			
			if (postLayoutTransform && hasComplexLayoutMatrix)
				return stroke + MatrixUtil.getEllipseBoundingBox(width / 2, height / 2, width / 2, height / 2, 
					layoutFeatures.layoutMatrix).y;
			
			return stroke + this.y;
		}
		
		/**
		 *  @private
		 *  Returns the bounding box of the transformed ellipse(width, height) with matrix m.
		 */
		private function getBoundingBox(width:Number, height:Number, m:Matrix):Rectangle
		{
			return MatrixUtil.getEllipseBoundingBox(0, 0, width / 2, height / 2, m);
		}
		
		/**
		 *  @private
		 */
		override public function setLayoutBoundsSize(width:Number,
													 height:Number,
													 postLayoutTransform:Boolean = true):void
		{
			var m:Matrix = getComplexMatrix(postLayoutTransform);
			if (!m)
			{
				super.setLayoutBoundsSize(width, height, postLayoutTransform);
				return;
			}
			
			setLayoutBoundsTransformed(width, height, m);
		}
		
		/**
		 *  @private
		 */
		private function setLayoutBoundsTransformed(width:Number, height:Number, m:Matrix):void
		{
			var strokeExtents:Rectangle = getStrokeExtents(true);
			width -= strokeExtents.width;
			height -= strokeExtents.height;
			
			var size:Point = fitLayoutBoundsIterative(width, height, m);
			
			// We couldn't find a solution, try to relax the constraints
			if (!size && !isNaN(width) && !isNaN(height))
			{
				// Try without width constraint
				var size1:Point = fitLayoutBoundsIterative(NaN, height, m);
				
				// Try without height constraint
				var size2:Point = fitLayoutBoundsIterative(width, NaN, m);
				
				// Ignore solutions that will exceed the requested size
				if (size1 && getBoundingBox(size1.x, size1.y, m).width > width)
					size1 = null;
				if (size2 && getBoundingBox(size2.x, size2.y, m).height > height)
					size2 = null;
				
				// Which size was better?
				if (size1 && size2)
				{
					var pickSize1:Boolean = size1.x * size1.y > size2.x * size2.y;
					
					if (pickSize1)
						size = size1;
					else
						size = size2;
				}
				else if (size1)
				{
					size = size1;
				}
				else
				{
					size = size2;
				}
			}
			
			if (size)
				setActualSize(size.x, size.y);
			else
				setActualSize(minWidth, minHeight);
		}
		
		/**
		 *  Iteratively approach a solution. Returns 0 if no exact solution exists.
		 *  NaN values for width/height mean "not constrained" in that dimesion. 
		 * 
		 *  @private
		 */
		private function fitLayoutBoundsIterative(width:Number, height:Number, m:Matrix):Point
		{
			var newWidth:Number = this.preferredWidthPreTransform();
			var newHeight:Number = this.preferredHeightPreTransform();
			var fitWidth:Number = MatrixUtil.transformBounds(newWidth, newHeight, m).x;
			var fitHeight:Number = MatrixUtil.transformBounds(newWidth, newHeight, m).y;
			
			if (isNaN(width))
				fitWidth = NaN;
			if (isNaN(height))
				fitHeight = NaN;
			
			var i:int = 0;
			while (i++ < 150)
			{
				var postTransformBounds:Rectangle = getBoundingBox(newWidth, newHeight, m);
				
				var widthDifference:Number = isNaN(width) ? 0 : width - postTransformBounds.width;
				var heightDifference:Number = isNaN(height) ? 0 : height - postTransformBounds.height;
				
				if (Math.abs(widthDifference) < 0.1 && Math.abs(heightDifference) < 0.1)
				{
					return new Point(newWidth, newHeight);
				}
				
				fitWidth += widthDifference * 0.5;
				fitHeight += heightDifference * 0.5;
				
				var newSize:Point = MatrixUtil.fitBounds(fitWidth, 
					fitHeight, 
					m,
					explicitWidth, 
					explicitHeight,
					preferredWidthPreTransform(),
					preferredHeightPreTransform(),
					minWidth, minHeight,
					maxWidth, maxHeight);
				
				if (!newSize)
					break;
				
				newWidth = newSize.x;
				newHeight = newSize.y;
			}
			
			return null;        
		}
	}
}
