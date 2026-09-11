<?php
/**
 * Enregistrement des types de contenu.
 *
 * Aucun n'est public : WordPress ne sert pas de pages ici, il ne sert que des
 * données au site Next. Les types restent visibles dans l'administration, et
 * seulement là.
 */

defined( 'ABSPATH' ) || exit;

function kastell_enregistrer_types() {
	$commun = array(
		'public'              => false,
		'publicly_queryable'  => false,
		'exclude_from_search' => true,
		'show_ui'             => true,
		/*
		 * WordPress ajoute lui-même une entrée de menu par type quand on lui
		 * en désigne un parent. Elle doublonnerait avec la liste ordonnée que
		 * construit kastell_menu(), et avec des intitulés différents. On lui
		 * laisse donc les écrans d'édition, mais pas le menu.
		 */
		'show_in_menu'        => false,
		'show_in_rest'        => false,
		'has_archive'         => false,
		'rewrite'             => false,
		'capability_type'     => 'post',
		'map_meta_cap'        => true,
	);

	foreach ( kastell_singletons() as $type => $def ) {
		register_post_type(
			$type,
			array_merge(
				$commun,
				array(
					'label'    => $def['titre'],
					'labels'   => array( 'name' => $def['titre'], 'singular_name' => $def['titre'] ),
					'supports' => array( 'title' ),
				)
			)
		);
	}

	foreach ( kastell_collections() as $type => $def ) {
		register_post_type(
			$type,
			array_merge(
				$commun,
				array(
					'label'  => $def['titre'],
					'labels' => array(
						'name'          => $def['titre'],
						'singular_name' => $def['singulier'],
						'add_new_item'  => 'Ajouter : ' . $def['singulier'],
						'edit_item'     => 'Modifier : ' . $def['singulier'],
						'search_items'  => 'Rechercher',
						'not_found'     => 'Aucun élément pour le moment.',
					),
					/* page-attributes fournit le champ « ordre », qui pilote
					   l'ordre d'affichage sur le site. */
					'supports' => array( 'title', 'page-attributes' ),
				)
			)
		);
	}
}
add_action( 'init', 'kastell_enregistrer_types' );

/** Un menu unique, pour ne pas éparpiller les rubriques dans la barre latérale. */
function kastell_menu() {
	add_menu_page(
		'Contenu du site',
		'Contenu du site',
		'edit_posts',
		'kastell-contenu',
		'kastell_page_accueil',
		'dashicons-admin-site-alt3',
		3
	);

	/* Première entrée explicite : sans elle WordPress en fabrique une qui
	   reprend le nom du menu, et la renommer après coup revient à écraser une
	   entrée dont on ne maîtrise pas le rang. */
	add_submenu_page(
		'kastell-contenu',
		'Vue d’ensemble',
		'Vue d’ensemble',
		'edit_posts',
		'kastell-contenu',
		'kastell_page_accueil'
	);

	/* Chaque rubrique unique mène droit à son formulaire : pas de liste à
	   parcourir, pas de bouton « ajouter » à côté duquel se tromper. */
	foreach ( kastell_singletons() as $type => $def ) {
		$id = kastell_id_singleton( $type );
		if ( ! $id ) {
			continue;
		}
		add_submenu_page(
			'kastell-contenu',
			$def['titre'],
			$def['menu'],
			'edit_posts',
			'post.php?post=' . $id . '&action=edit'
		);
	}

	foreach ( kastell_collections() as $type => $def ) {
		add_submenu_page(
			'kastell-contenu',
			$def['titre'],
			$def['titre'],
			'edit_posts',
			'edit.php?post_type=' . $type
		);
	}


}
add_action( 'admin_menu', 'kastell_menu' );

/**
 * Identifiant de la fiche unique d'une rubrique, créée à la volée si besoin.
 *
 * La créer paresseusement plutôt qu'à l'activation évite qu'une rubrique
 * ajoutée plus tard reste invisible faute de réactivation de l'extension.
 */
function kastell_id_singleton( $type ) {
	$existants = get_posts(
		array(
			'post_type'        => $type,
			'post_status'      => array( 'publish', 'draft' ),
			'numberposts'      => 1,
			'fields'           => 'ids',
			'suppress_filters' => false,
		)
	);
	if ( ! empty( $existants ) ) {
		return (int) $existants[0];
	}

	$definitions = kastell_singletons();
	if ( ! isset( $definitions[ $type ] ) ) {
		return 0;
	}

	$id = wp_insert_post(
		array(
			'post_type'   => $type,
			'post_status' => 'publish',
			'post_title'  => $definitions[ $type ]['titre'],
		)
	);
	return is_wp_error( $id ) ? 0 : (int) $id;
}

/** Une rubrique unique ne se duplique pas et ne s'ajoute pas. */
function kastell_bloquer_ajout() {
	global $typenow;
	if ( isset( kastell_singletons()[ $typenow ] ) ) {
		echo '<style>.page-title-action{display:none}</style>';
	}
}
add_action( 'admin_head', 'kastell_bloquer_ajout' );
