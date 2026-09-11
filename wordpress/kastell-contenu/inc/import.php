<?php
/**
 * Import du contenu initial.
 *
 * Sans lui, l'éditrice ouvre un back-office aux champs vides : elle ne peut
 * rien « modifier », seulement tout retaper depuis le site. L'import verse dans
 * WordPress les textes que le site affiche déjà, ce qui rend la première prise
 * en main possible.
 *
 * Deux règles, qui rendent l'opération sans danger :
 *   - on ne remplit qu'un champ vide, jamais on n'écrase une saisie ;
 *   - on n'ajoute une fiche de liste que si la liste est vide.
 * Relancer l'import ne peut donc rien détruire.
 */

defined( 'ABSPATH' ) || exit;

function kastell_contenu_initial() {
	$chemin = dirname( __DIR__ ) . '/contenu-initial.json';
	if ( ! file_exists( $chemin ) ) {
		return null;
	}
	$brut = file_get_contents( $chemin );
	$data = json_decode( $brut, true );
	return is_array( $data ) ? $data : null;
}

function kastell_importer() {
	$data = kastell_contenu_initial();
	if ( ! $data ) {
		return array( 'erreur' => 'Le fichier contenu-initial.json est introuvable ou illisible.' );
	}

	$champs_remplis = 0;
	$fiches_creees  = 0;

	foreach ( kastell_singletons() as $type => $def ) {
		$valeurs = $data[ $def['cle'] ] ?? array();
		if ( empty( $valeurs ) ) {
			continue;
		}
		$id = kastell_id_singleton( $type );
		if ( ! $id ) {
			continue;
		}
		foreach ( $def['champs'] as $cle => $definition ) {
			if ( ! isset( $valeurs[ $cle ] ) || '' === $valeurs[ $cle ] ) {
				continue;
			}
			$actuel = get_post_meta( $id, KASTELL_PREFIXE . $cle, true );
			if ( '' !== $actuel ) {
				continue; // saisie existante : on n'y touche pas
			}
			update_post_meta( $id, KASTELL_PREFIXE . $cle, (string) $valeurs[ $cle ] );
			$champs_remplis++;
		}
	}

	foreach ( kastell_collections() as $type => $def ) {
		$elements = $data[ $type ] ?? array();
		if ( empty( $elements ) ) {
			continue;
		}

		$deja = get_posts(
			array(
				'post_type'   => $type,
				'post_status' => array( 'publish', 'draft' ),
				'numberposts' => 1,
				'fields'      => 'ids',
			)
		);
		if ( ! empty( $deja ) ) {
			continue; // la liste est déjà alimentée : on la laisse telle quelle
		}

		foreach ( $elements as $rang => $element ) {
			$id = wp_insert_post(
				array(
					'post_type'   => $type,
					'post_status' => 'publish',
					'post_title'  => (string) ( $element[ $def['titre_champ'] ] ?? '' ),
					'menu_order'  => $rang + 1,
				)
			);
			if ( is_wp_error( $id ) ) {
				continue;
			}
			$fiches_creees++;
			foreach ( $def['champs'] as $cle => $definition ) {
				if ( ! isset( $element[ $cle ] ) || '' === $element[ $cle ] ) {
					continue;
				}
				update_post_meta( $id, KASTELL_PREFIXE . $cle, (string) $element[ $cle ] );
			}
		}
	}

	return array( 'champs' => $champs_remplis, 'fiches' => $fiches_creees );
}

/** Déclenché depuis la vue d'ensemble. */
function kastell_traiter_import() {
	if ( ! isset( $_GET['kastell_import'] ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( 'Droits insuffisants.' );
	}
	check_admin_referer( 'kastell_import' );

	$bilan = kastell_importer();
	$url   = admin_url( 'admin.php?page=kastell-contenu' );

	if ( isset( $bilan['erreur'] ) ) {
		$url = add_query_arg( 'kastell_bilan', 'erreur', $url );
	} else {
		$url = add_query_arg(
			array( 'kastell_bilan' => 'ok', 'champs' => $bilan['champs'], 'fiches' => $bilan['fiches'] ),
			$url
		);
	}
	wp_safe_redirect( $url );
	exit;
}
add_action( 'admin_init', 'kastell_traiter_import' );
