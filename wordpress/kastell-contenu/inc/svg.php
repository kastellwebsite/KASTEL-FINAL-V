<?php
/**
 * Téléversement des logos au format SVG.
 *
 * WordPress refuse le SVG par défaut, et pour une bonne raison : un SVG est un
 * document XML, il peut porter du script, et il est servi depuis le domaine du
 * back-office. Le refuser en bloc coûte cependant cher ici — un logo de client
 * est presque toujours livré en SVG, et le convertir en PNG le rend flou sur
 * les écrans denses.
 *
 * On l'accepte donc, mais jamais tel quel : chaque fichier est réécrit à partir
 * d'une liste blanche avant d'entrer dans la médiathèque. Ce qui n'y figure pas
 * ne survit pas au téléversement, si bien que le fichier déposé et le fichier
 * stocké peuvent différer — c'est voulu.
 */

defined( 'ABSPATH' ) || exit;

/** Éléments conservés. Tout le reste est retiré, script et animation compris. */
function kastell_svg_elements_permis() {
	return array(
		'svg', 'g', 'defs', 'symbol', 'use', 'switch', 'a', 'image', 'title', 'desc', 'metadata',
		'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
		'text', 'tspan', 'textpath',
		'clippath', 'mask', 'pattern', 'marker',
		'lineargradient', 'radialgradient', 'stop',
		'filter', 'fegaussianblur', 'feoffset', 'feblend', 'fecolormatrix',
		'femerge', 'femergenode', 'feflood', 'fecomposite', 'fedropshadow',
		'style',
	);
}

/**
 * Attributs retirés quelle que soit la balise.
 *
 * Les gestionnaires « on… » sont traités à part : ils se déclinent à l'infini
 * et une liste nominative en laisserait toujours passer un.
 */
function kastell_svg_attributs_interdits() {
	return array( 'xlink:script', 'script', 'externalresourcesrequired', 'requiredextensions' );
}

/**
 * Réécrit un SVG à partir de la liste blanche.
 *
 * Renvoie le document nettoyé, ou null si le fichier n'est pas un SVG lisible —
 * mieux vaut refuser un fichier douteux que d'en stocker une version dont on
 * n'est pas sûr.
 */
function kastell_svg_nettoyer( $source ) {
	if ( ! is_string( $source ) || '' === trim( $source ) ) {
		return null;
	}

	/* Une entité peut servir à faire enfler le document à l'ouverture ou à lire
	   un fichier du serveur. On ne cherche pas à l'assainir : on refuse. */
	if ( false !== stripos( $source, '<!ENTITY' ) ) {
		return null;
	}

	/* Le prologue de type de document n'apporte rien à un logo et ouvre la
	   porte aux entités : on le retire avant même de lire le document. */
	$source = preg_replace( '/<!DOCTYPE[^>\[]*(\[[^\]]*\])?>/is', '', $source );

	$avant = libxml_use_internal_errors( true );
	$dom   = new DOMDocument();
	$dom->preserveWhiteSpace = false;
	$charge = $dom->loadXML( $source, LIBXML_NONET );
	libxml_clear_errors();
	libxml_use_internal_errors( $avant );

	if ( ! $charge || ! $dom->documentElement ) {
		return null;
	}
	if ( 'svg' !== strtolower( $dom->documentElement->localName ) ) {
		return null;
	}

	/* Une instruction de traitement peut porter une feuille de style externe. */
	$xpath = new DOMXPath( $dom );
	foreach ( iterator_to_array( $xpath->query( '//processing-instruction()' ) ) as $pi ) {
		$pi->parentNode->removeChild( $pi );
	}

	kastell_svg_elaguer( $dom->documentElement );

	$sortie = $dom->saveXML();
	return is_string( $sortie ) ? $sortie : null;
}

/** Parcourt l'arbre en profondeur et retire ce qui n'est pas autorisé. */
function kastell_svg_elaguer( DOMElement $element ) {
	$permis    = kastell_svg_elements_permis();
	$interdits = kastell_svg_attributs_interdits();

	/* Copie figée : retirer un nœud pendant l'itération sauterait le suivant. */
	foreach ( iterator_to_array( $element->childNodes ) as $enfant ) {
		if ( $enfant instanceof DOMElement ) {
			if ( ! in_array( strtolower( $enfant->localName ), $permis, true ) ) {
				$element->removeChild( $enfant );
				continue;
			}
			kastell_svg_elaguer( $enfant );
		} elseif ( ! ( $enfant instanceof DOMText ) && ! ( $enfant instanceof DOMCdataSection ) ) {
			$element->removeChild( $enfant );
		}
	}

	/* Le contenu d'un bloc <style> n'est pas un attribut : il échappait au
	   contrôle ci-dessous alors qu'il peut porter un import ou une adresse
	   externe. Un logo exporté d'Illustrator n'a que des règles de couleur ;
	   si le bloc contient autre chose, on le retire en entier plutôt que de
	   tenter une réécriture partielle, où se logent les contournements. */
	if ( 'style' === strtolower( $element->localName ) ) {
		if ( preg_match( '/(javascript\s*:|expression\s*\(|behaviou?r\s*:|@import|url\s*\(\s*["\']?(?!#))/i', $element->textContent ) ) {
			$element->parentNode->removeChild( $element );
			return;
		}
	}

	foreach ( iterator_to_array( $element->attributes ) as $attribut ) {
		$nom    = strtolower( $attribut->nodeName );
		$valeur = $attribut->nodeValue;

		if ( 0 === strpos( $nom, 'on' ) || in_array( $nom, $interdits, true ) ) {
			$element->removeAttributeNode( $attribut );
			continue;
		}

		/* Un lien ne peut viser qu'un identifiant du document lui-même : un
		   « javascript: » s'exécute au clic, un lien externe fait fuiter la
		   consultation vers un tiers. */
		if ( 'href' === $nom || 'xlink:href' === $nom ) {
			$cible = trim( $valeur );
			/* Une référence interne, ou une image matricielle embarquée. Jamais
			   un SVG en data: — il rouvrirait exactement la porte qu'on ferme,
			   et jamais une adresse externe, qui ferait fuiter la consultation. */
			$interne = (bool) preg_match( '/^#[A-Za-z0-9_.:-]+$/', $cible );
			$embarque = (bool) preg_match( '#^data:image/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=\\s]+$#i', $cible );
			if ( ! $interne && ! $embarque ) {
				$element->removeAttributeNode( $attribut );
			}
			continue;
		}

		/* Même règle dans les styles : seule la référence interne survit. */
		if ( preg_match( '/(javascript\s*:|expression\s*\(|behaviou?r\s*:|@import)/i', $valeur )
			|| preg_match( '/url\s*\(\s*["\']?(?!#)/i', $valeur ) ) {
			$element->removeAttributeNode( $attribut );
		}
	}
}

/**
 * Déclare le SVG comme format téléversable.
 *
 * Réservé à qui peut déjà déposer un fichier : la fonction ne fait qu'ajouter
 * une extension à la liste, elle n'ouvre aucun droit nouveau.
 */
function kastell_svg_autoriser( $types ) {
	if ( current_user_can( 'upload_files' ) ) {
		$types['svg'] = 'image/svg+xml';
	}
	return $types;
}
add_filter( 'upload_mimes', 'kastell_svg_autoriser' );

/**
 * WordPress vérifie que le contenu correspond à l'extension. Pour un SVG, la
 * détection renvoie souvent « text/plain » ou « text/html » et le fichier est
 * rejeté avant même d'arriver ici. On rétablit le verdict — le contenu, lui,
 * a déjà été vérifié par le nettoyage ci-dessous, qui s'exécute avant.
 */
function kastell_svg_confirmer_le_type( $donnees, $fichier, $nom, $mimes, $vrai_mime = null ) {
	if ( preg_match( '/\.svg$/i', $nom ) && current_user_can( 'upload_files' ) ) {
		$donnees['ext']             = 'svg';
		$donnees['type']            = 'image/svg+xml';
		$donnees['proper_filename'] = false;
	}
	return $donnees;
}
add_filter( 'wp_check_filetype_and_ext', 'kastell_svg_confirmer_le_type', 10, 5 );

/**
 * Nettoie le fichier avant qu'il n'entre dans la médiathèque.
 *
 * C'est le seul endroit où le fichier est encore hors de l'espace public : une
 * fois déplacé, il est servi tel quel à qui connaît son adresse.
 */
function kastell_svg_nettoyer_au_televersement( $fichier ) {
	if ( ! empty( $fichier['error'] ) ) {
		return $fichier;
	}
	if ( ! preg_match( '/\.svg$/i', $fichier['name'] ?? '' ) ) {
		return $fichier;
	}

	$source = file_get_contents( $fichier['tmp_name'] );
	$propre = kastell_svg_nettoyer( $source );

	if ( null === $propre ) {
		$fichier['error'] = "Ce fichier SVG n'a pas pu être lu comme une image vectorielle. Réenregistrez-le depuis votre logiciel de dessin, ou déposez un PNG.";
		return $fichier;
	}

	file_put_contents( $fichier['tmp_name'], $propre );
	return $fichier;
}
add_filter( 'wp_handle_upload_prefilter', 'kastell_svg_nettoyer_au_televersement' );

/**
 * Un SVG n'a pas toujours de dimensions déclarées : la médiathèque l'affiche
 * alors en tout petit, ou au contraire déborde de sa vignette. Quelques règles
 * suffisent à le remettre dans son cadre.
 */
function kastell_svg_styles_admin() {
	echo '<style>'
		. '.media-icon img[src$=".svg"],.attachment-preview img[src$=".svg"],'
		. '.thumbnail img[src$=".svg"],.media-frame img[src$=".svg"]'
		. '{width:100%;height:auto;max-height:100%;}'
		. '</style>';
}
add_action( 'admin_head', 'kastell_svg_styles_admin' );
