<?php
/**
 * Route d'agrégation.
 *
 * Le site Next fait un seul appel et reçoit les cinq rubriques d'un coup.
 * L'enveloppe reproduit exactement celle que produisait la requête Sanity :
 * c'est le contrat entre les deux moitiés, et il permet au site de basculer
 * d'une source à l'autre sans toucher à sa couche d'affichage.
 *
 * Lecture publique : ces données sont précisément celles qu'affiche le site.
 * Rien ici n'est plus sensible que la page d'accueil elle-même.
 */

defined( 'ABSPATH' ) || exit;

function kastell_enregistrer_route() {
	register_rest_route(
		'kastell/v1',
		'/contenu',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'kastell_reponse_contenu',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'kastell_enregistrer_route' );

/** Découpe un champ « lignes » en tableau, en écartant les lignes vides. */
function kastell_en_lignes( $valeur ) {
	if ( ! is_string( $valeur ) || '' === trim( $valeur ) ) {
		return array();
	}
	$lignes = preg_split( '/\R+/u', trim( $valeur ) );
	return array_values( array_filter( array_map( 'trim', $lignes ), 'strlen' ) );
}

/** Valeurs d'une fiche, converties selon le genre déclaré. */
function kastell_valeurs( $post_id, $champs ) {
	$sortie = array();
	foreach ( $champs as $cle => $def ) {
		$valeur = get_post_meta( $post_id, KASTELL_PREFIXE . $cle, true );
		$sortie[ $cle ] = ( 'lignes' === $def[0] )
			? kastell_en_lignes( $valeur )
			: (string) $valeur;
	}
	return $sortie;
}

function kastell_reponse_contenu() {
	$enveloppe = array();

	foreach ( kastell_singletons() as $type => $def ) {
		$id = kastell_id_singleton( $type );
		$enveloppe[ $def['cle'] ] = $id ? kastell_valeurs( $id, $def['champs'] ) : array();
	}

	foreach ( kastell_collections() as $type => $def ) {
		$fiches = get_posts(
			array(
				'post_type'        => $type,
				'post_status'      => 'publish',
				'numberposts'      => -1,
				'orderby'          => array( 'menu_order' => 'ASC', 'date' => 'ASC' ),
				'suppress_filters' => false,
			)
		);

		$elements = array();
		foreach ( $fiches as $fiche ) {
			$element = kastell_valeurs( $fiche->ID, $def['champs'] );
			$element[ $def['titre_champ'] ] = $fiche->post_title;
			$elements[] = $element;
		}

		/* Une rubrique peut ne pas exister si aucun champ unique ne l'a créée :
		   la liste doit tout de même trouver où se ranger. */
		if ( ! isset( $enveloppe[ $def['rubrique'] ] ) ) {
			$enveloppe[ $def['rubrique'] ] = array();
		}
		$enveloppe[ $def['rubrique'] ][ $def['liste'] ] = $elements;
	}

	/* Le site attend le cas pratique regroupé ; il est saisi en deux champs
	   pour rester lisible dans l'administration. */
	if ( ! empty( $enveloppe['offres']['liste'] ) ) {
		foreach ( $enveloppe['offres']['liste'] as $rang => $offre ) {
			$titre = $offre['casPratiqueTitre'] ?? '';
			$recit = $offre['casPratiqueRecit'] ?? '';
			$enveloppe['offres']['liste'][ $rang ]['casPratique'] =
				( '' !== $titre && '' !== $recit )
					? array( 'title' => $titre, 'body' => $recit )
					: null;
		}
	}

	/* Date de dernière modification, toutes rubriques confondues : le plan du
	   site l'annonce aux moteurs, qui savent alors s'ils ont déjà lu cette
	   version. Sans elle, chaque relecture repart de zéro. */
	$enveloppe['maj'] = kastell_derniere_modification();

	$reponse = rest_ensure_response( $enveloppe );
	/* Le cache est piloté par le site (revalidation à la publication) ; on évite
	   qu'un cache intermédiaire serve une version périmée après un webhook. */
	$reponse->header( 'Cache-Control', 'no-store, max-age=0' );
	return $reponse;
}

/**
 * Date de la modification la plus récente parmi tous les contenus Kastell.
 *
 * Renvoie null tant qu'aucune fiche n'existe : le site retombe alors sur sa
 * propre date de construction plutôt que d'annoncer une date inventée.
 */
function kastell_derniere_modification() {
	$types = array_merge( array_keys( kastell_singletons() ), array_keys( kastell_collections() ) );
	if ( ! $types ) {
		return null;
	}

	$fiches = get_posts(
		array(
			'post_type'        => $types,
			'post_status'      => 'publish',
			'numberposts'      => 1,
			'orderby'          => 'modified',
			'order'            => 'DESC',
			'suppress_filters' => false,
		)
	);

	if ( empty( $fiches ) ) {
		return null;
	}
	return gmdate( 'c', strtotime( $fiches[0]->post_modified_gmt . ' UTC' ) );
}
