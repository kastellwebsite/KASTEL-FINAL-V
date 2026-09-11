<?php
/**
 * Purge du cache du site à chaque publication.
 *
 * WordPress prévient Next, qui vide le cache de la rubrique « contenu ». Sans
 * ce signal, une modification n'apparaîtrait qu'au bout d'une minute — le délai
 * de revalidation du site. Rien de cassé sans lui, seulement plus lent.
 *
 * L'adresse et le secret se renseignent dans l'administration, rubrique
 * « Contenu du site » (voir inc/reglages.php).
 */

defined( 'ABSPATH' ) || exit;

function kastell_types_suivis() {
	return array_merge(
		array_keys( kastell_singletons() ),
		array_keys( kastell_collections() )
	);
}

function kastell_prevenir_le_site( $post_id, $post = null ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}

	$type = $post ? $post->post_type : get_post_type( $post_id );
	if ( ! in_array( $type, kastell_types_suivis(), true ) ) {
		return;
	}
	if ( ! kastell_est_lie() ) {
		return;
	}

	/* Envoi non bloquant : l'enregistrement d'un article ne doit pas attendre
	   la réponse d'un service tiers, ni échouer si celui-ci est indisponible. */
	wp_remote_post(
		kastell_site_url() . '/api/revalidate',
		array(
			'timeout'  => 5,
			'blocking' => false,
			'headers'  => array(
				'content-type'     => 'application/json',
				'x-kastell-secret' => kastell_secret(),
			),
			'body'     => wp_json_encode( array( 'type' => $type ) ),
		)
	);
}
add_action( 'save_post', 'kastell_prevenir_le_site', 20, 2 );
add_action( 'deleted_post', 'kastell_prevenir_le_site', 20 );
