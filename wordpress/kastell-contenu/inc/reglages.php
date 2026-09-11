<?php
/**
 * Adresse du site et secret partagé.
 *
 * Ces deux valeurs se saisissent dans l'administration. La version précédente
 * les exigeait dans wp-config.php : c'est la bonne pratique WordPress, mais
 * elle suppose un accès au système de fichiers que la personne qui gère le
 * contenu n'a pas — et sans elles, les boutons restaient inactifs.
 *
 * Les constantes restent reconnues et gardent la priorité : une installation
 * déjà configurée ainsi continue de fonctionner, et un hébergement qui préfère
 * sortir le secret de la base de données le peut toujours.
 */

defined( 'ABSPATH' ) || exit;

const KASTELL_OPTION_URL    = 'kastell_site_url';
const KASTELL_OPTION_SECRET = 'kastell_secret';

/** Adresse du site public, sans barre oblique finale. */
function kastell_site_url() {
	$valeur = defined( 'KASTELL_SITE_URL' ) ? KASTELL_SITE_URL : (string) get_option( KASTELL_OPTION_URL, '' );
	return rtrim( trim( $valeur ), '/' );
}

/** Secret partagé avec le site. */
function kastell_secret() {
	return defined( 'KASTELL_SECRET' ) ? KASTELL_SECRET : (string) get_option( KASTELL_OPTION_SECRET, '' );
}

/** La liaison est-elle configurée, d'une manière ou de l'autre ? */
function kastell_est_lie() {
	return '' !== kastell_site_url() && '' !== kastell_secret();
}

/** Les valeurs viennent-elles de wp-config.php ? Le formulaire le dit alors. */
function kastell_reglages_verrouilles() {
	return defined( 'KASTELL_SITE_URL' ) && defined( 'KASTELL_SECRET' );
}

/** Enregistrement du formulaire de la vue d'ensemble. */
function kastell_enregistrer_reglages() {
	/* Réglage d'installation, pas de contenu : réservé aux administrateurs. */
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Droits insuffisants.' );
	}
	check_admin_referer( 'kastell_reglages' );

	$url = isset( $_POST['kastell_site_url'] )
		? esc_url_raw( trim( wp_unslash( $_POST['kastell_site_url'] ) ) )
		: '';
	/* Pas de sanitize_text_field sur le secret : il en normaliserait les
	   espaces, et un secret modifié en silence ne correspondrait plus. */
	$secret = isset( $_POST['kastell_secret'] )
		? trim( (string) wp_unslash( $_POST['kastell_secret'] ) )
		: '';

	update_option( KASTELL_OPTION_URL, rtrim( $url, '/' ) );
	if ( '' !== $secret ) {
		update_option( KASTELL_OPTION_SECRET, $secret );
	}

	wp_safe_redirect(
		add_query_arg( 'kastell_reglages', 'ok', admin_url( 'admin.php?page=kastell-contenu' ) )
	);
	exit;
}
add_action( 'admin_post_kastell_reglages', 'kastell_enregistrer_reglages' );

/**
 * Le formulaire.
 *
 * Le secret n'est jamais réaffiché : le champ reste vide et ne remplace la
 * valeur enregistrée que s'il est rempli. Le réafficher le mettrait dans le
 * HTML de la page à chaque visite, sans rien apporter — personne n'a besoin de
 * le relire, seulement de le remplacer.
 */
function kastell_formulaire_reglages() {
	if ( ! current_user_can( 'manage_options' ) ) {
		echo '<p class="kastell-alerte">La liaison avec le site n’est pas encore configurée. Demandez à la personne qui administre le site WordPress de la renseigner.</p>';
		return;
	}

	if ( kastell_reglages_verrouilles() ) {
		echo '<p class="description">Ces valeurs proviennent de <code>wp-config.php</code> et ne se modifient pas ici.</p>';
		return;
	}

	$url    = kastell_site_url();
	$secret = kastell_secret();

	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="kastell-reglages">';
	wp_nonce_field( 'kastell_reglages' );
	echo '<input type="hidden" name="action" value="kastell_reglages" />';

	echo '<p><label for="kastell_site_url"><strong>Adresse du site public</strong></label>';
	printf(
		'<input type="url" id="kastell_site_url" name="kastell_site_url" value="%s" class="regular-text" placeholder="https://kastell-conseils.fr" />',
		esc_attr( $url )
	);
	echo '<span class="description">L’adresse que voient les visiteurs, pas celle de WordPress.</span></p>';

	echo '<p><label for="kastell_secret"><strong>Secret partagé</strong></label>';
	printf(
		'<input type="password" id="kastell_secret" name="kastell_secret" value="" class="regular-text" autocomplete="new-password" placeholder="%s" />',
		esc_attr( '' === $secret ? 'à recopier depuis Vercel' : '•••••••• (enregistré — laisser vide pour conserver)' )
	);
	echo '<span class="description">La valeur de la variable <code>REVALIDATE_SECRET</code> dans Vercel, recopiée à l’identique.</span></p>';

	submit_button( 'Enregistrer la liaison' );
	echo '</form>';
}
