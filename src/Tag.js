// Browser
Tag = function( s, o ){
	var b = s.nodeName 
	, e = b ? s : document.createElement( s )
	//if( o ) extend( e, o ) // bug en Object.assign
	Object.assign( e, o )
	Object.assign( e, Tag.prototype )
	return e
	}
Object.assign( Tag.prototype ,{
	cssClass( sClassName, sAction ){
		return Tag.className( this, sClassName, sAction )
		},
	appendNodes(){
		var o=this
		each( to_array( arguments ), function( e ){ if( e && e.nodeName) o.appendChild( e )})
		return this
		},
	setOpacity( n ){
		var s =  Style.calculate( 'opacity', n )
		var a1 = s.split( ';' )//, o = {}
		for( var i=0, ni=a1.length; i<ni; i++ ){
			var a = a1[i].split( ':' )
			, sAttribute = a[0].trim()
			, sValue = ( a[1] || '' ).trim()
			if( a.length == 2 ){
				//o[ sAttribute ] = sValue
				this.style[ sAttribute ] = n == 1 ? null : sValue // str_replace( "^([\"'])([^\1]*?)\1$" , '$2' , sValue )
				}
			}
		//return o
		}
	})
Object.assign( Tag, {
	className( e, sClassName, sAction ){
		var s = e.className
		, re = new RegExp( '(^|\\s+)'+ sClassName +'($|\\s+)', 'gim' )
		, b = re.test( s )
		if( sAction=='toggle' ) sAction = b ? 'remove' : 'add'
		switch( sAction ){
			case 'add': if( ! b ) s = s +' '+ sClassName
				break
			case 'delete':
			case 'remove': if( b ) s = s.replace( re, '$1$2' )
				break
			default: return b
			}
		return e.className = s.trim()
		},
	fullscreen( e, b ){
		var s = b == undefined ? 'toggle' : ( b ? 'add' : 'delete' )
		Tag.className( e, 'fullscreen', s )
		Tag.className( getTags( 'BODY' )[0], 'fullscreen', s )
		// e.scrollIntoView() // c'est pas super...
		},
	outerHTML( e ){
		if( e.outerHTML ) return e.outerHTML
		var aAttributes = e.attributes||[], sAttrs = ''
		for( var i=0; i<aAttributes.length; i++ )
			sAttrs += ' ' + aAttributes[i].name + '="' + aAttributes[i].value + '"'
		return '<' + e.tagName + sAttrs + '>' + e.innerHTML + '</' + e.tagName + '>'
		},
	replaceHtml( e, html ){ // pour 1000 lignes : plus rapide pour moz
		/*@cc_on // Pure innerHTML is slightly faster in IE
			e.innerHTML = html;
			return e;
		@*/
		var eNewElement = e.cloneNode( false )
		eNewElement.innerHTML = html
		e.parentNode.replaceChild( eNewElement, e )
		return eNewElement
		},

	addChildNodes( m, s, a, mSelected ){
		var eSelected = null
		, mSelected = mSelected || null
		, addChild =function( e, m ){
			var eChild = Tag( s )
			switch( m.constructor ){
				case Object: Object.assign( eChild, m ); break
				case String: 
					eChild.innerHTML = str_replace( '&', '&amp;', m )
					if( s.toLowerCase()=='option' ) eChild.value = m
					break
				default: 
				}
			e.appendChild( eChild )
			}
		, appendNodes =function( e ){
			if( a ) for( var i=0, ni=a.length; i<ni; i++ ) addChild( e, a[i])
			e.value = mSelected
			}
		if( m.constructor==Array )
			for( var i=0, ni=m.length; i<ni; i++ ) appendNodes( m[i])
		else appendNodes( m )
		return m
		},
	interlock(){
		for(var i=arguments.length-1;i>0;i--)
			arguments[i-1].appendChild( arguments[i])
		return arguments[0]
		},
	removeChildNodes( e ){
		while(e.childNodes.length>0)e.removeChild(e.firstChild)
		},
	removeNode( e ){
		return e.parentNode.removeChild( e )
		},
	setChildNodes( e, s, a, mSelected ){
		e.style.display = 'none'
		Tag.removeChildNodes( e )
		Tag.addChildNodes( e, s, a, mSelected )
		e.value=mSelected||null
		e.style.display = ''
		return e
		},

	cotes( eNode ){
		var pos=Tag.position(eNode)
		,dim=Tag.dimension(eNode)
		return { left:pos.left, top:pos.top, width:dim.width, height:dim.height }
		},
	dimension( e ){
	//	var o1 = e.style 
	//	, b1 = o1.display == 'none'
	//	, s = o1.position
	//	if( b1 ) Object.assign( o1, { position:'absolute', display:'' })
		var oDim = { width:e.offsetWidth+'px' , height:e.offsetHeight+'px' }
	//	if( b1 ) Object.assign( o1, { position:s, display:'none' })
		return oDim 
		},
	position( e ){
		if( e.parentNode === null || e.style.display == 'none' ) return false
		var parent = null
		, pos = {}
		, box
		if( e.getBoundingClientRect ){ // IE
			box = e.getBoundingClientRect()
			var scroll =  Browser.scrollAttr()
			, o = { left: box.left + scroll.left , top: box.top + scroll.top }
				// TEST TEST Navigation & ColorPicker
				if( window.parent == window && Browser.isIE ){
					o.left -= 2
					o.top -= 2
					}
			return o
			}
		else if( document.getBoxObjectFor ){ // gecko
			box = document.getBoxObjectFor( e )
			pos = { left:box.x, top:box.y }
			}
		else { // safari / opera
			pos = { left:e.offsetLeft, top:e.offsetTop }
			parent = e.offsetParent
			if( parent != e ){
				while( parent ){
					pos.left += parent.offsetLeft
					pos.top += parent.offsetTop
					parent = parent.offsetParent
					}
				}
			// opera & (safari absolute) incorrectly account for body offsetTop
			if( Browser.isOpera || ( Browser.isSafari && e.style.position == 'absolute' ))
				pos.top -= document.body.offsetTop
			}
		for( parent = e.parentNode ; parent && parent.tagName != 'BODY' && parent.tagName != 'HTML' ; parent = parent.parentNode ){
			pos.left -= parent.scrollLeft
			pos.top -= parent.scrollTop
			}
		return pos
		}
	})